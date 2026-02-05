import listEmployee from "@/assets/data/list-employee.json";

export type Employee = {
  id: string;
  id_employee: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string | null;
  phone: string | null;
  current_address: string | null;
  address: string | null;
  branch: string;
  job: string;
  organization: string;
  title: string;
  status_employee: string | null;
  tax_status: string | null;
  marital_status: string | null;
  religion: string | null;
  gender: string | null;
  blood_type: string | null;
  join_date: string | null;
  birth_date: string | null;
  avatar: string | null;
  grade: string | null;
  class: string | null;
};

type EmployeeDirectoryJson = {
  data?: {
    data?: Employee[];
  };
};

const employeeDirectory = listEmployee as unknown as EmployeeDirectoryJson;

export async function getEmployeeDirectory(): Promise<Employee[]> {
  return employeeDirectory.data?.data ?? [];
}
