import api from './api';
import { ApiResponse } from './presensi/types';

export interface PayrollSummary {
  id: string;
  month: string;
  year: number;
  net_salary: number;
  status: 'paid' | 'pending';
  payment_date?: string;
}

export interface PenaltyItem {
  id: string;
  description: string;
  amount: number;
}

export interface PayrollDetail {
  id: string;
  month: string;
  year: number;
  gross_salary: number;
  overtime_amount: number;
  penalties_amount: number;
  net_salary: number;
  status: 'paid' | 'pending';
  payment_date?: string;
  penalties_breakdown: PenaltyItem[];
  allowances_breakdown?: { description: string; amount: number }[];
  deductions_breakdown?: { description: string; amount: number }[];
}

export const getPayrollList = async (): Promise<PayrollSummary[]> => {
  const response = await api.get<ApiResponse<PayrollSummary[]>>('/payroll');

  if (!response.data.success) {
    throw new Error(response.data.message || 'Gagal memuat data payroll');
  }

  return response.data.data;
};

export const getPayrollDetail = async (id: string): Promise<PayrollDetail> => {
  const response = await api.get<ApiResponse<PayrollDetail>>(`/payroll/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Gagal memuat detail payroll');
  }

  return response.data.data;
};
