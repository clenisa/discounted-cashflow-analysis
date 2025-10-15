import { useMemo } from 'react';
import { SupabaseDataService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

export const useDataService = () => {
  const dataService = useMemo(() => new SupabaseDataService(supabase), []);
  return dataService;
};