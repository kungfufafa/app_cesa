import { useQuery } from '@tanstack/react-query';
import { getPayrollDetail, getPayrollList } from '@/services/payroll';
import { payrollKeys } from './keys';

export const usePayrollList = () => {
  return useQuery({
    queryKey: payrollKeys.lists(),
    queryFn: getPayrollList,
  });
};

export const usePayrollDetail = (id: string) => {
  return useQuery({
    queryKey: payrollKeys.detail(id),
    queryFn: () => getPayrollDetail(id),
    enabled: !!id,
  });
};
