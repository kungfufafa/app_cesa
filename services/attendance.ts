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

export interface AttendanceLog {
  id: string;
  date: string; // ISO string for the date part
  clockIn?: string; // ISO string
  clockOut?: string; // ISO string
  status: 'on-time' | 'late' | 'absent';
}

export const getHistory = async (month: number, year: number): Promise<AttendanceLog[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Generate 10 dummy records
  const history: AttendanceLog[] = [];
  const today = new Date();
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(year, month, today.getDate() - i);
    const dateStr = date.toISOString();
    
    // Skip weekends for realism
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const isLate = Math.random() > 0.8;
    const isAbsent = Math.random() > 0.95;

    let status: 'on-time' | 'late' | 'absent' = 'on-time';
    if (isAbsent) status = 'absent';
    else if (isLate) status = 'late';

    let clockIn = undefined;
    let clockOut = undefined;

    if (!isAbsent) {
      // 09:00 +/- random minutes
      const clockInTime = new Date(date);
      clockInTime.setHours(9, Math.floor(Math.random() * 30), 0);
      if (isLate) clockInTime.setMinutes(Math.floor(Math.random() * 30) + 31); // > 9:30
      clockIn = clockInTime.toISOString();

      // 17:00 +/- random minutes
      const clockOutTime = new Date(date);
      clockOutTime.setHours(17, Math.floor(Math.random() * 60), 0);
      clockOut = clockOutTime.toISOString();
    }

    history.push({
      id: `log-${i}`,
      date: dateStr,
      clockIn,
      clockOut,
      status,
    });
  }

  return history;
};
