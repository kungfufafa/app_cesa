import api from './api';
import { parseApiEnvelope } from './api-response';
import { z } from "zod";

const numberSchema = z.coerce.number();

const penaltyItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  amount: numberSchema,
});

const allowanceItemSchema = z.object({
  description: z.string().min(1),
  amount: numberSchema,
});

const payrollStatusSchema = z.enum(['paid', 'pending']);

const payrollSummarySchema = z.object({
  id: z.string().min(1),
  month: z.string().min(1),
  year: z.coerce.number().int(),
  net_salary: numberSchema,
  status: payrollStatusSchema,
  payment_date: z.string().min(1).optional(),
});

const payrollDetailSchema = z.object({
  id: z.string().min(1),
  month: z.string().min(1),
  year: z.coerce.number().int(),
  gross_salary: numberSchema,
  overtime_amount: numberSchema,
  penalties_amount: numberSchema,
  net_salary: numberSchema,
  status: payrollStatusSchema,
  payment_date: z.string().min(1).optional(),
  penalties_breakdown: z.array(penaltyItemSchema),
  allowances_breakdown: z.array(allowanceItemSchema).optional(),
  deductions_breakdown: z.array(allowanceItemSchema).optional(),
});

export type PayrollSummary = z.infer<typeof payrollSummarySchema>;
export type PenaltyItem = z.infer<typeof penaltyItemSchema>;
export type PayrollDetail = z.infer<typeof payrollDetailSchema>;

export const getPayrollList = async (): Promise<PayrollSummary[]> => {
  const response = await api.get('/payroll');
  return parseApiEnvelope(
    z.array(payrollSummarySchema),
    response.data,
    'Gagal memuat data payroll.'
  );
};

export const getPayrollDetail = async (id: string): Promise<PayrollDetail> => {
  const response = await api.get(`/payroll/${id}`);
  return parseApiEnvelope(
    payrollDetailSchema,
    response.data,
    'Gagal memuat detail payroll.'
  );
};
