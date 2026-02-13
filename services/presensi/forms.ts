import api from '@/services/api';
import { ApiResponse } from './types';

export interface LeaveRequest {
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  file?: {
    uri: string;
    name: string;
    mimeType: string;
  } | null;
}

export interface LeaveItem {
  id: number;
  type: string;
  start_date: string | null;
  end_date: string | null;
  reason: string;
  status: string;
  note?: string | null;
  attachment?: string | null;
}

export interface OvertimeRequest {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  file?: {
    uri: string;
    name: string;
    mimeType: string;
  } | null;
}

export interface OvertimeItem {
  id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  status: string;
  note?: string | null;
  attachment?: string | null;
}

export const submitLeave = async (data: LeaveRequest) => {
  const formData = new FormData();
  formData.append('type', data.type);
  formData.append('start_date', data.start_date);
  formData.append('end_date', data.end_date);
  formData.append('reason', data.reason);

  if (data.file) {
    // @ts-ignore
    formData.append('file', {
      uri: data.file.uri,
      name: data.file.name,
      type: data.file.mimeType,
    });
  }

  const response = await api.post('/api/leaves', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const submitOvertime = async (data: OvertimeRequest) => {
  const formData = new FormData();
  formData.append('date', data.date);
  formData.append('start_time', data.start_time);
  formData.append('end_time', data.end_time);
  formData.append('reason', data.reason);

  if (data.file) {
    // @ts-ignore
    formData.append('file', {
      uri: data.file.uri,
      name: data.file.name,
      type: data.file.mimeType,
    });
  }

  const response = await api.post('/api/overtimes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
