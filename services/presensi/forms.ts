import api from '@/services/api';
import { ApiResponse } from './types';

export interface LeaveRequest {
  start_date: string;
  end_date: string;
  reason: string;
  note?: string;
}

export interface LeaveItem {
  id: number;
  start_date: string | null;
  end_date: string | null;
  reason: string;
  status: string;
  note?: string | null;
}

export interface OvertimeRequest {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface OvertimeItem {
  id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  status: string;
  note?: string | null;
}

export const submitLeave = async (data: LeaveRequest) => {
  const response = await api.post('/api/leaves', data);
  return response.data;
};

export const submitOvertime = async (data: OvertimeRequest) => {
  const response = await api.post('/api/overtimes', data);
  return response.data;
};

export const getOvertimes = async (): Promise<OvertimeItem[]> => {
  const response = await api.get<ApiResponse<OvertimeItem[]>>('/api/overtimes');

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch overtime list');
  }

  return response.data.data ?? [];
};

export const getLeaves = async (): Promise<LeaveItem[]> => {
  const response = await api.get<ApiResponse<LeaveItem[]>>('/api/leaves');

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch leave list');
  }

  return response.data.data ?? [];
};
