import { useQuery } from "@tanstack/react-query";
import { getEmployeeDirectory } from "@/services/employee";

const employeeKeys = {
  all: ["employee"] as const,
  directory: () => [...employeeKeys.all, "directory"] as const,
};

export function useEmployeeDirectory() {
  return useQuery({
    queryKey: employeeKeys.directory(),
    queryFn: getEmployeeDirectory,
  });
}
