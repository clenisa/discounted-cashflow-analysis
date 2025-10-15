import { useMemo } from 'react';
import { SupabaseDataService, LocalDataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const useDataService = () => {
  return useMemo(() => {
    if (isSupabaseConfigured && supabase) {
      return new SupabaseDataService(supabase);
    }

    return new LocalDataService();
  }, []);
};
