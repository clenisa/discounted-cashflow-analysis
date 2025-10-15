-- Create financial_data_templates table
CREATE TABLE financial_data_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'industry', 'company_size', 'geography', etc.
  
  -- Template data
  ebitda_data JSONB NOT NULL,
  income_statement_data JSONB,
  fiscal_year_labels JSONB,
  base_currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Default parameters
  default_discount_rate DECIMAL(5,2),
  default_perpetuity_rate DECIMAL(5,2),
  default_corporate_tax_rate DECIMAL(5,2),
  
  -- Metadata
  is_public BOOLEAN DEFAULT FALSE,
  is_system_template BOOLEAN DEFAULT FALSE, -- For built-in templates
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_financial_templates_category ON financial_data_templates(category);
CREATE INDEX idx_financial_templates_is_public ON financial_data_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_financial_templates_usage_count ON financial_data_templates(usage_count DESC);
CREATE INDEX idx_financial_templates_tags ON financial_data_templates USING GIN(tags);

-- Enable RLS
ALTER TABLE financial_data_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view public templates" ON financial_data_templates
  FOR SELECT USING (is_public = true OR is_system_template = true);

CREATE POLICY "Users can view their own templates" ON financial_data_templates
  FOR SELECT USING (auth.uid() = created_by_user_id);

CREATE POLICY "Users can create templates" ON financial_data_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Users can update their own templates" ON financial_data_templates
  FOR UPDATE USING (auth.uid() = created_by_user_id);

CREATE POLICY "Users can delete their own templates" ON financial_data_templates
  FOR DELETE USING (auth.uid() = created_by_user_id);