import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { HelpdeskAttachmentList } from "@/components/features/helpdesk/HelpdeskAttachmentList";
import {
  HelpdeskSelectionModal,
  type HelpdeskSelectionOption,
} from "@/components/features/helpdesk/HelpdeskSelectionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/components/ui/text";
import {
  isHelpdeskAttachmentTooLarge,
  MAX_HELPDESK_ATTACHMENTS,
  pickHelpdeskAttachments,
  toHelpdeskFileUploads,
} from "@/lib/helpdesk-attachments";
import { plainTextToHtml } from "@/lib/helpdesk-rich-text";
import type {
  HelpdeskAttachment,
  HelpdeskFileUpload,
  HelpdeskMeta,
} from "@/services/helpdesk";

type HelpdeskTicketFormValues = {
  priority_id?: number | null;
  unit_id?: number | null;
  problem_category_id?: number | null;
  company_id?: number | null;
  responsible_id?: number | null;
  title?: string;
  description?: string;
  descriptionHtml?: string | null;
  existingAttachments?: HelpdeskAttachment[];
};

type HelpdeskTicketFormSubmitPayload = {
  priority_id: number;
  unit_id: number;
  problem_category_id: number;
  company_id?: number | null;
  responsible_id?: number | null;
  title: string;
  description: string;
  existing_supporting_attachments?: string[];
  supporting_attachments?: HelpdeskFileUpload[];
};

type HelpdeskTicketFormProps = {
  meta: HelpdeskMeta;
  scopedMeta?: HelpdeskMeta;
  initialValues?: HelpdeskTicketFormValues;
  canAssignResponsible?: boolean;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (payload: HelpdeskTicketFormSubmitPayload) => void | Promise<void>;
  onUnitChange?: (unitId?: number) => void;
};

type ModalKey =
  | "priority"
  | "unit"
  | "category"
  | "company"
  | "responsible"
  | null;

const buildNamedOptions = (
  items: { id: number; name: string }[]
): HelpdeskSelectionOption[] =>
  items.map((item) => ({
    label: item.name,
    value: item.id,
  }));

export function HelpdeskTicketForm({
  meta,
  scopedMeta,
  initialValues,
  canAssignResponsible = false,
  submitLabel,
  isSubmitting = false,
  serverError,
  onSubmit,
  onUnitChange,
}: HelpdeskTicketFormProps) {
  const activeMeta = scopedMeta ?? meta;
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [priorityId, setPriorityId] = useState<number | null>(
    initialValues?.priority_id ?? null
  );
  const [unitId, setUnitId] = useState<number | null>(initialValues?.unit_id ?? null);
  const [problemCategoryId, setProblemCategoryId] = useState<number | null>(
    initialValues?.problem_category_id ?? null
  );
  const [companyId, setCompanyId] = useState<number | null>(
    initialValues?.company_id ?? null
  );
  const [responsibleId, setResponsibleId] = useState<number | null>(
    initialValues?.responsible_id ?? null
  );
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [existingAttachments, setExistingAttachments] = useState<HelpdeskAttachment[]>(
    initialValues?.existingAttachments ?? []
  );
  const [newAttachments, setNewAttachments] = useState<HelpdeskFileUpload[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const initialDescriptionPlainText = initialValues?.description?.trim() ?? "";
  const initialDescriptionHtml = initialValues?.descriptionHtml?.trim() ?? "";
  const shouldIncludeExistingAttachmentsField =
    initialValues?.existingAttachments !== undefined;

  useEffect(() => {
    onUnitChange?.(unitId ?? undefined);
  }, [onUnitChange, unitId]);

  useEffect(() => {
    const categoryStillAvailable = activeMeta.problem_categories.some(
      (item) => item.id === problemCategoryId
    );

    if (problemCategoryId && !categoryStillAvailable) {
      setProblemCategoryId(null);
    }

    const responsibleStillAvailable = activeMeta.responsible_users.some(
      (item) => item.id === responsibleId
    );

    if (responsibleId && !responsibleStillAvailable) {
      setResponsibleId(null);
    }
  }, [activeMeta.problem_categories, activeMeta.responsible_users, problemCategoryId, responsibleId]);

  const findLabel = (
    items: { id: number; name: string }[],
    selectedId: number | null,
    fallback: string
  ) => items.find((item) => item.id === selectedId)?.name ?? fallback;

  const remainingAttachmentSlots =
    MAX_HELPDESK_ATTACHMENTS - existingAttachments.length - newAttachments.length;

  const handleAddAttachments = async () => {
    if (remainingAttachmentSlots <= 0) {
      Alert.alert(
        "Batas Lampiran",
        `Maksimal ${MAX_HELPDESK_ATTACHMENTS} file per tiket.`
      );
      return;
    }

    const picked = await pickHelpdeskAttachments(remainingAttachmentSlots);

    if (picked.length === 0) {
      return;
    }

    const oversized = picked.find(isHelpdeskAttachmentTooLarge);
    if (oversized) {
      Alert.alert(
        "File Terlalu Besar",
        `${oversized.name} melebihi batas 10 MB.`
      );
      return;
    }

    setNewAttachments((current) => [...current, ...toHelpdeskFileUploads(picked)]);
  };

  const handleSubmit = async () => {
    if (!priorityId || !unitId || !problemCategoryId || !title.trim() || !description.trim()) {
      setValidationError("Prioritas, unit, kategori, judul, dan deskripsi wajib diisi.");
      return;
    }

    setValidationError(null);

    const normalizedDescription = description.trim();
    const serializedDescription =
      initialDescriptionHtml &&
      normalizedDescription === initialDescriptionPlainText
        ? initialDescriptionHtml
        : plainTextToHtml(normalizedDescription);

    const payload: HelpdeskTicketFormSubmitPayload = {
      priority_id: priorityId,
      unit_id: unitId,
      problem_category_id: problemCategoryId,
      company_id: companyId ?? meta.default_company_id ?? undefined,
      responsible_id: canAssignResponsible ? responsibleId : undefined,
      title: title.trim(),
      description: serializedDescription,
    };

    if (shouldIncludeExistingAttachmentsField) {
      payload.existing_supporting_attachments = existingAttachments.map(
        (item) => item.path
      );
    }

    if (newAttachments.length > 0) {
      payload.supporting_attachments = newAttachments;
    }

    await onSubmit(payload);
  };

  const errorMessage = validationError ?? serverError ?? null;

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <Card className="py-0">
            <CardContent className="py-5 gap-4">
              <SelectionField
                label="Prioritas"
                value={findLabel(meta.priorities, priorityId, "Pilih prioritas")}
                onPress={() => setActiveModal("priority")}
              />
              <SelectionField
                label="Unit"
                value={findLabel(meta.units, unitId, "Pilih unit")}
                onPress={() => setActiveModal("unit")}
              />
              <SelectionField
                label="Kategori Masalah"
                value={findLabel(
                  activeMeta.problem_categories,
                  problemCategoryId,
                  unitId ? "Pilih kategori" : "Pilih unit dulu"
                )}
                onPress={() => setActiveModal("category")}
              />
              <SelectionField
                label="Perusahaan"
                value={findLabel(
                  meta.companies,
                  companyId ?? meta.default_company_id ?? null,
                  "Gunakan perusahaan default"
                )}
                hint={
                  companyId == null && meta.default_company_id
                    ? "Jika kosong, backend akan memakai perusahaan default."
                    : undefined
                }
                onPress={() => setActiveModal("company")}
              />
              {canAssignResponsible ? (
                <SelectionField
                  label="Penanggung Jawab"
                  value={findLabel(
                    activeMeta.responsible_users,
                    responsibleId,
                    "Belum ditentukan"
                  )}
                  hint="Optional"
                  onPress={() => setActiveModal("responsible")}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardContent className="py-5 gap-4">
              <View className="gap-2">
                <Label>Judul</Label>
                <Input
                  placeholder="Contoh: Printer di finance offline"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              <View className="gap-2">
                <Label>Deskripsi</Label>
                <Textarea
                  placeholder="Jelaskan masalah yang sedang terjadi."
                  value={description}
                  onChangeText={setDescription}
                  numberOfLines={5}
                  className="min-h-32 py-3"
                />
              </View>
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardContent className="py-5 gap-4">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="font-semibold">Lampiran</Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    Maksimal {MAX_HELPDESK_ATTACHMENTS} file, tiap file maksimal 10 MB.
                  </Text>
                </View>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={handleAddAttachments}
                >
                  <Text>Tambah</Text>
                </Button>
              </View>

              <HelpdeskAttachmentList
                existingAttachments={existingAttachments}
                newAttachments={newAttachments}
                onRemoveExisting={(path) =>
                  setExistingAttachments((current) =>
                    current.filter((item) => item.path !== path)
                  )
                }
                onRemoveNew={(index) =>
                  setNewAttachments((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
              />
            </CardContent>
          </Card>

          {errorMessage ? (
            <Text className="text-destructive text-sm">{errorMessage}</Text>
          ) : null}

          <Button onPress={handleSubmit} disabled={isSubmitting} size="lg">
            <Text className="text-primary-foreground font-bold">{submitLabel}</Text>
          </Button>
        </View>
      </ScrollView>

      <HelpdeskSelectionModal
        visible={activeModal === "priority"}
        title="Pilih Prioritas"
        options={buildNamedOptions(meta.priorities)}
        selectedValue={priorityId}
        onClose={() => setActiveModal(null)}
        onSelect={(value) => setPriorityId(typeof value === "number" ? value : Number(value))}
      />
      <HelpdeskSelectionModal
        visible={activeModal === "unit"}
        title="Pilih Unit"
        options={buildNamedOptions(meta.units)}
        selectedValue={unitId}
        onClose={() => setActiveModal(null)}
        onSelect={(value) => {
          const nextValue = typeof value === "number" ? value : Number(value);
          setUnitId(nextValue);
          setProblemCategoryId(null);
          setResponsibleId(null);
        }}
      />
      <HelpdeskSelectionModal
        visible={activeModal === "category"}
        title="Pilih Kategori Masalah"
        options={buildNamedOptions(activeMeta.problem_categories)}
        selectedValue={problemCategoryId}
        onClose={() => setActiveModal(null)}
        onSelect={(value) =>
          setProblemCategoryId(typeof value === "number" ? value : Number(value))
        }
        emptyText={unitId ? "Belum ada kategori di unit ini." : "Pilih unit terlebih dulu."}
      />
      <HelpdeskSelectionModal
        visible={activeModal === "company"}
        title="Pilih Perusahaan"
        options={buildNamedOptions(meta.companies)}
        selectedValue={companyId}
        onClose={() => setActiveModal(null)}
        onSelect={(value) =>
          setCompanyId(value == null ? null : typeof value === "number" ? value : Number(value))
        }
        allowClear
        clearLabel="Gunakan perusahaan default"
      />
      <HelpdeskSelectionModal
        visible={activeModal === "responsible"}
        title="Pilih Penanggung Jawab"
        options={buildNamedOptions(activeMeta.responsible_users)}
        selectedValue={responsibleId}
        onClose={() => setActiveModal(null)}
        onSelect={(value) =>
          setResponsibleId(value == null ? null : typeof value === "number" ? value : Number(value))
        }
        allowClear
        clearLabel="Kosongkan penanggung jawab"
      />
    </>
  );
}

function SelectionField({
  label,
  value,
  hint,
  onPress,
}: {
  label: string;
  value: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <View className="gap-2">
      <Label>{label}</Label>
      <Pressable
        className="rounded-xl border border-border bg-background px-4 py-3"
        onPress={onPress}
      >
        <Text className="font-medium">{value}</Text>
        {hint ? (
          <Text className="text-xs text-muted-foreground mt-1">{hint}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}
