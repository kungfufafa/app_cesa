import listEmployee from "@/assets/data/list-employee.json";
import { createApiError } from "@/lib/api-errors";
import { z } from "zod";

const nullableStringSchema = z.string().nullable();

const employeeSchema = z.object({
  id: z.string().min(1),
  id_employee: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  mobile_phone: nullableStringSchema,
  phone: nullableStringSchema,
  current_address: nullableStringSchema,
  address: nullableStringSchema,
  branch: z.string().min(1),
  job: z.string().min(1),
  organization: z.string().min(1),
  title: z.string().min(1),
  status_employee: nullableStringSchema,
  tax_status: nullableStringSchema,
  marital_status: nullableStringSchema,
  religion: nullableStringSchema,
  gender: nullableStringSchema,
  blood_type: nullableStringSchema,
  join_date: nullableStringSchema,
  birth_date: nullableStringSchema,
  avatar: nullableStringSchema,
  grade: nullableStringSchema,
  class: nullableStringSchema,
});

const employeeDirectorySchema = z.object({
  data: z.object({
    data: z.array(employeeSchema),
  }),
});

export type Employee = z.infer<typeof employeeSchema>;

export async function getEmployeeDirectory(): Promise<Employee[]> {
  const parsed = employeeDirectorySchema.safeParse(listEmployee);

  if (!parsed.success) {
    if (__DEV__) {
      console.warn(
        "[employee] Invalid local directory payload",
        parsed.error.issues
      );
    }

    throw createApiError(
      new Error("Data direktori karyawan tidak valid."),
      "server"
    );
  }

  return parsed.data.data.data;
}
