-- Create dcf_models table
CREATE TABLE dcf_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  description TEXT,
  
  -- DCF Parameters
  discount_rate DECIMAL(5,2) NOT NULL CHECK (discount_rate > 0),
  perpetuity_rate DECIMAL(5,2) NOT NULL CHECK (perpetuity_rate > 0),
  corporate_tax_rate DECIMAL(5,2) NOT NULL CHECK (corporate_tax_rate >= 0 AND corporate_tax_rate <= 100),
  
  -- Financial Data (JSONB for flexibility)
  ebitda_data JSONB NOT NULL, -- {year: amount} format
  income_statement_data JSONB, -- Optional income statement data
  income_statement_adjustments JSONB, -- Optional adjustments
  fiscal_year_labels JSONB, -- Custom year labels
  
  -- Configuration
  use_income_statement BOOLEAN DEFAULT FALSE,
  base_currency VARCHAR(3) DEFAULT 'EUR' CHECK (base_currency IN ('EUR', 'USD')),
  
  -- Calculated Results (cached for performance)
  enterprise_value DECIMAL(15,2),
  terminal_value DECIMAL(15,2),
  terminal_value_pv DECIMAL(15,2),
  projections_pv DECIMAL(15,2),
  present_values JSONB, -- Array of year-by-year breakdowns
  
  -- Metadata
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_discount_vs_growth CHECK (discount_rate > perpetuity_rate)
);

-- Create indexes
CREATE INDEX idx_dcf_models_user_id ON dcf_models(user_id);
CREATE INDEX idx_dcf_models_created_at ON dcf_models(created_at DESC);
CREATE INDEX idx_dcf_models_is_template ON dcf_models(is_template) WHERE is_template = true;
CREATE INDEX idx_dcf_models_is_public ON dcf_models(is_public) WHERE is_public = true;
CREATE INDEX idx_dcf_models_tags ON dcf_models USING GIN(tags);

-- Enable RLS
ALTER TABLE dcf_models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own models" ON dcf_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public models" ON dcf_models
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own models" ON dcf_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" ON dcf_models
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models" ON dcf_models
  FOR DELETE USING (auth.uid() = user_id);