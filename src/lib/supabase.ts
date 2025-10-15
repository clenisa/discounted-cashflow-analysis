import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      dcf_models: {
        Row: {
          id: string;
          user_id: string;
          model_name: string;
          company_name: string | null;
          description: string | null;
          discount_rate: number;
          perpetuity_rate: number;
          corporate_tax_rate: number;
          ebitda_data: any;
          income_statement_data: any | null;
          income_statement_adjustments: any | null;
          fiscal_year_labels: any | null;
          use_income_statement: boolean;
          base_currency: string;
          enterprise_value: number | null;
          terminal_value: number | null;
          terminal_value_pv: number | null;
          projections_pv: number | null;
          present_values: any | null;
          is_template: boolean;
          is_public: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model_name: string;
          company_name?: string | null;
          description?: string | null;
          discount_rate: number;
          perpetuity_rate: number;
          corporate_tax_rate: number;
          ebitda_data: any;
          income_statement_data?: any | null;
          income_statement_adjustments?: any | null;
          fiscal_year_labels?: any | null;
          use_income_statement?: boolean;
          base_currency?: string;
          enterprise_value?: number | null;
          terminal_value?: number | null;
          terminal_value_pv?: number | null;
          projections_pv?: number | null;
          present_values?: any | null;
          is_template?: boolean;
          is_public?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model_name?: string;
          company_name?: string | null;
          description?: string | null;
          discount_rate?: number;
          perpetuity_rate?: number;
          corporate_tax_rate?: number;
          ebitda_data?: any;
          income_statement_data?: any | null;
          income_statement_adjustments?: any | null;
          fiscal_year_labels?: any | null;
          use_income_statement?: boolean;
          base_currency?: string;
          enterprise_value?: number | null;
          terminal_value?: number | null;
          terminal_value_pv?: number | null;
          projections_pv?: number | null;
          present_values?: any | null;
          is_template?: boolean;
          is_public?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      dcf_scenarios: {
        Row: {
          id: string;
          user_id: string;
          model_id: string;
          scenario_name: string;
          description: string | null;
          discount_rate: number | null;
          perpetuity_rate: number | null;
          corporate_tax_rate: number | null;
          ebitda_data: any | null;
          income_statement_data: any | null;
          income_statement_adjustments: any | null;
          enterprise_value: number | null;
          terminal_value: number | null;
          terminal_value_pv: number | null;
          projections_pv: number | null;
          present_values: any | null;
          is_base_scenario: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model_id: string;
          scenario_name: string;
          description?: string | null;
          discount_rate?: number | null;
          perpetuity_rate?: number | null;
          corporate_tax_rate?: number | null;
          ebitda_data?: any | null;
          income_statement_data?: any | null;
          income_statement_adjustments?: any | null;
          enterprise_value?: number | null;
          terminal_value?: number | null;
          terminal_value_pv?: number | null;
          projections_pv?: number | null;
          present_values?: any | null;
          is_base_scenario?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model_id?: string;
          scenario_name?: string;
          description?: string | null;
          discount_rate?: number | null;
          perpetuity_rate?: number | null;
          corporate_tax_rate?: number | null;
          ebitda_data?: any | null;
          income_statement_data?: any | null;
          income_statement_adjustments?: any | null;
          enterprise_value?: number | null;
          terminal_value?: number | null;
          terminal_value_pv?: number | null;
          projections_pv?: number | null;
          present_values?: any | null;
          is_base_scenario?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      dcf_model_shares: {
        Row: {
          id: string;
          model_id: string;
          shared_by_user_id: string;
          shared_with_user_id: string | null;
          shared_with_email: string | null;
          can_view: boolean;
          can_edit: boolean;
          can_share: boolean;
          can_delete: boolean;
          expires_at: string | null;
          is_active: boolean;
          share_token: string | null;
          message: string | null;
          created_at: string;
          last_accessed_at: string | null;
        };
        Insert: {
          id?: string;
          model_id: string;
          shared_by_user_id: string;
          shared_with_user_id?: string | null;
          shared_with_email?: string | null;
          can_view?: boolean;
          can_edit?: boolean;
          can_share?: boolean;
          can_delete?: boolean;
          expires_at?: string | null;
          is_active?: boolean;
          share_token?: string | null;
          message?: string | null;
          created_at?: string;
          last_accessed_at?: string | null;
        };
        Update: {
          id?: string;
          model_id?: string;
          shared_by_user_id?: string;
          shared_with_user_id?: string | null;
          shared_with_email?: string | null;
          can_view?: boolean;
          can_edit?: boolean;
          can_share?: boolean;
          can_delete?: boolean;
          expires_at?: string | null;
          is_active?: boolean;
          share_token?: string | null;
          message?: string | null;
          created_at?: string;
          last_accessed_at?: string | null;
        };
      };
      dcf_model_versions: {
        Row: {
          id: string;
          model_id: string;
          version_number: number;
          created_by_user_id: string;
          model_data: any;
          change_summary: string | null;
          change_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          model_id: string;
          version_number: number;
          created_by_user_id: string;
          model_data: any;
          change_summary?: string | null;
          change_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          model_id?: string;
          version_number?: number;
          created_by_user_id?: string;
          model_data?: any;
          change_summary?: string | null;
          change_type?: string;
          created_at?: string;
        };
      };
      financial_data_templates: {
        Row: {
          id: string;
          created_by_user_id: string | null;
          template_name: string;
          description: string | null;
          category: string | null;
          ebitda_data: any;
          income_statement_data: any | null;
          fiscal_year_labels: any | null;
          base_currency: string;
          default_discount_rate: number | null;
          default_perpetuity_rate: number | null;
          default_corporate_tax_rate: number | null;
          is_public: boolean;
          is_system_template: boolean;
          tags: string[];
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by_user_id?: string | null;
          template_name: string;
          description?: string | null;
          category?: string | null;
          ebitda_data: any;
          income_statement_data?: any | null;
          fiscal_year_labels?: any | null;
          base_currency?: string;
          default_discount_rate?: number | null;
          default_perpetuity_rate?: number | null;
          default_corporate_tax_rate?: number | null;
          is_public?: boolean;
          is_system_template?: boolean;
          tags?: string[];
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by_user_id?: string | null;
          template_name?: string;
          description?: string | null;
          category?: string | null;
          ebitda_data?: any;
          income_statement_data?: any | null;
          fiscal_year_labels?: any | null;
          base_currency?: string;
          default_discount_rate?: number | null;
          default_perpetuity_rate?: number | null;
          default_corporate_tax_rate?: number | null;
          is_public?: boolean;
          is_system_template?: boolean;
          tags?: string[];
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      user_models_with_scenarios: {
        Row: {
          id: string;
          user_id: string;
          model_name: string;
          company_name: string | null;
          description: string | null;
          discount_rate: number;
          perpetuity_rate: number;
          corporate_tax_rate: number;
          ebitda_data: any;
          income_statement_data: any | null;
          income_statement_adjustments: any | null;
          fiscal_year_labels: any | null;
          use_income_statement: boolean;
          base_currency: string;
          enterprise_value: number | null;
          terminal_value: number | null;
          terminal_value_pv: number | null;
          projections_pv: number | null;
          present_values: any | null;
          is_template: boolean;
          is_public: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
          scenario_count: number;
          last_scenario_update: string | null;
        };
      };
      user_accessible_models: {
        Row: {
          id: string;
          user_id: string;
          model_name: string;
          company_name: string | null;
          description: string | null;
          discount_rate: number;
          perpetuity_rate: number;
          corporate_tax_rate: number;
          ebitda_data: any;
          income_statement_data: any | null;
          income_statement_adjustments: any | null;
          fiscal_year_labels: any | null;
          use_income_statement: boolean;
          base_currency: string;
          enterprise_value: number | null;
          terminal_value: number | null;
          terminal_value_pv: number | null;
          projections_pv: number | null;
          present_values: any | null;
          is_template: boolean;
          is_public: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
          access_level: string;
        };
      };
      dcf_model_stats: {
        Row: {
          id: string;
          model_name: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          total_scenarios: number;
          total_versions: number;
          last_version_created: string | null;
          total_shares: number;
        };
      };
    };
  };
};