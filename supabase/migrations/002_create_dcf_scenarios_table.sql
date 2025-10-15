-- Create dcf_scenarios table
CREATE TABLE dcf_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES dcf_models(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Scenario-specific parameters
  discount_rate DECIMAL(5,2),
  perpetuity_rate DECIMAL(5,2),
  corporate_tax_rate DECIMAL(5,2),
  
  -- Scenario-specific data
  ebitda_data JSONB,
  income_statement_data JSONB,
  income_statement_adjustments JSONB,
  
  -- Calculated results for this scenario
  enterprise_value DECIMAL(15,2),
  terminal_value DECIMAL(15,2),
  terminal_value_pv DECIMAL(15,2),
  projections_pv DECIMAL(15,2),
  present_values JSONB,
  
  -- Metadata
  is_base_scenario BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(model_id, scenario_name),
  CONSTRAINT valid_scenario_discount_vs_growth CHECK (discount_rate > perpetuity_rate)
);

-- Create indexes
CREATE INDEX idx_dcf_scenarios_user_id ON dcf_scenarios(user_id);
CREATE INDEX idx_dcf_scenarios_model_id ON dcf_scenarios(model_id);
CREATE INDEX idx_dcf_scenarios_sort_order ON dcf_scenarios(model_id, sort_order);

-- Enable RLS
ALTER TABLE dcf_scenarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage scenarios for their models" ON dcf_scenarios
  FOR ALL USING (
    auth.uid() = user_id AND 
    model_id IN (SELECT id FROM dcf_models WHERE user_id = auth.uid())
  );