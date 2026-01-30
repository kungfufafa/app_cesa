export interface AttendanceRecord {
  id: string;
  userId: string;
  type: 'in' | 'out';
  timestamp: string;
  latitude: number;
  longitude: number;
  photoBase64?: string;
}

export interface AttendanceStatus {
  clockedIn: boolean;
  lastClockIn?: string;
  lastClockOut?: string;
  shiftStart: string;
  shiftEnd: string;
}

let mockStatus: AttendanceStatus = {
  clockedIn: false,
  shiftStart: '09:00',
  shiftEnd: '17:00',
};

export const getTodayStatus = async (): Promise<AttendanceStatus> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...mockStatus };
};

export const clockIn = async (data: { latitude: number; longitude: number; photo: string }): Promise<AttendanceRecord> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const now = new Date().toISOString();
  mockStatus = {
    ...mockStatus,
    clockedIn: true,
    lastClockIn: now,
  };

  return {
    id: Math.random().toString(36).substr(2, 9),
    userId: 'user-123',
    type: 'in',
    timestamp: now,
    latitude: data.latitude,
    longitude: data.longitude,
    photoBase64: data.photo,
  };
};

export const clockOut = async (data: { latitude: number; longitude: number; photo: string }): Promise<AttendanceRecord> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const now = new Date().toISOString();
  mockStatus = {
    ...mockStatus,
    clockedIn: false,
    lastClockOut: now,
  };

  return {
    id: Math.random().toString(36).substr(2, 9),
    userId: 'user-123',
    type: 'out',
    timestamp: now,
    latitude: data.latitude,
    longitude: data.longitude,
    photoBase64: data.photo,
  };
};
