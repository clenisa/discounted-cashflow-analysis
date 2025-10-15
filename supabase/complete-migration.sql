-- Corporate Finance Feature - Complete Database Migration
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Create dcf_models table
-- =====================================================
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

-- Create indexes for dcf_models
CREATE INDEX idx_dcf_models_user_id ON dcf_models(user_id);
CREATE INDEX idx_dcf_models_created_at ON dcf_models(created_at DESC);
CREATE INDEX idx_dcf_models_is_template ON dcf_models(is_template) WHERE is_template = true;
CREATE INDEX idx_dcf_models_is_public ON dcf_models(is_public) WHERE is_public = true;
CREATE INDEX idx_dcf_models_tags ON dcf_models USING GIN(tags);

-- Enable RLS for dcf_models
ALTER TABLE dcf_models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dcf_models
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

-- =====================================================
-- 2. Create dcf_scenarios table
-- =====================================================
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

-- Create indexes for dcf_scenarios
CREATE INDEX idx_dcf_scenarios_user_id ON dcf_scenarios(user_id);
CREATE INDEX idx_dcf_scenarios_model_id ON dcf_scenarios(model_id);
CREATE INDEX idx_dcf_scenarios_sort_order ON dcf_scenarios(model_id, sort_order);

-- Enable RLS for dcf_scenarios
ALTER TABLE dcf_scenarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dcf_scenarios
CREATE POLICY "Users can manage scenarios for their models" ON dcf_scenarios
  FOR ALL USING (
    auth.uid() = user_id AND 
    model_id IN (SELECT id FROM dcf_models WHERE user_id = auth.uid())
  );

-- =====================================================
-- 3. Create dcf_model_shares table
-- =====================================================
CREATE TABLE dcf_model_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES dcf_models(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255), -- For sharing with non-users
  
  -- Permissions
  can_view BOOLEAN DEFAULT TRUE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_share BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  
  -- Access control
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  share_token VARCHAR(255) UNIQUE, -- For public sharing
  message TEXT, -- Optional message from sharer
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CHECK (shared_with_user_id IS NOT NULL OR shared_with_email IS NOT NULL OR share_token IS NOT NULL)
);

-- Create indexes for dcf_model_shares
CREATE INDEX idx_dcf_model_shares_model_id ON dcf_model_shares(model_id);
CREATE INDEX idx_dcf_model_shares_shared_with_user ON dcf_model_shares(shared_with_user_id);
CREATE INDEX idx_dcf_model_shares_share_token ON dcf_model_shares(share_token);
CREATE INDEX idx_dcf_model_shares_expires_at ON dcf_model_shares(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS for dcf_model_shares
ALTER TABLE dcf_model_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dcf_model_shares
CREATE POLICY "Users can view shares they created or received" ON dcf_model_shares
  FOR SELECT USING (
    auth.uid() = shared_by_user_id OR 
    auth.uid() = shared_with_user_id OR
    (share_token IS NOT NULL AND is_active = true AND (expires_at IS NULL OR expires_at > NOW()))
  );

CREATE POLICY "Users can create shares for their models" ON dcf_model_shares
  FOR INSERT WITH CHECK (
    auth.uid() = shared_by_user_id AND
    model_id IN (SELECT id FROM dcf_models WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update shares they created" ON dcf_model_shares
  FOR UPDATE USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can delete shares they created" ON dcf_model_shares
  FOR DELETE USING (auth.uid() = shared_by_user_id);

-- =====================================================
-- 4. Create dcf_model_versions table
-- =====================================================
CREATE TABLE dcf_model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES dcf_models(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Snapshot of model data at this version
  model_data JSONB NOT NULL, -- Complete model state
  change_summary TEXT,
  change_type VARCHAR(50) DEFAULT 'manual', -- 'manual', 'auto_save', 'import', 'template'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(model_id, version_number)
);

-- Create indexes for dcf_model_versions
CREATE INDEX idx_dcf_model_versions_model_id ON dcf_model_versions(model_id);
CREATE INDEX idx_dcf_model_versions_created_at ON dcf_model_versions(model_id, created_at DESC);

-- Enable RLS for dcf_model_versions
ALTER TABLE dcf_model_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dcf_model_versions
CREATE POLICY "Users can view versions of their models" ON dcf_model_versions
  FOR SELECT USING (
    model_id IN (SELECT id FROM dcf_models WHERE user_id = auth.uid()) OR
    model_id IN (SELECT model_id FROM dcf_model_shares WHERE shared_with_user_id = auth.uid() AND can_view = true)
  );

-- =====================================================
-- 5. Create financial_data_templates table
-- =====================================================
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

-- Create indexes for financial_data_templates
CREATE INDEX idx_financial_templates_category ON financial_data_templates(category);
CREATE INDEX idx_financial_templates_is_public ON financial_data_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_financial_templates_usage_count ON financial_data_templates(usage_count DESC);
CREATE INDEX idx_financial_templates_tags ON financial_data_templates USING GIN(tags);

-- Enable RLS for financial_data_templates
ALTER TABLE financial_data_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial_data_templates
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

-- =====================================================
-- 6. Create functions and triggers
-- =====================================================

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create auto-versioning function
CREATE OR REPLACE FUNCTION create_model_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM dcf_model_versions
  WHERE model_id = NEW.id;
  
  -- Create version record
  INSERT INTO dcf_model_versions (model_id, version_number, created_by_user_id, model_data, change_type)
  VALUES (
    NEW.id,
    next_version,
    NEW.user_id,
    to_jsonb(NEW),
    'auto_save'
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create usage tracking function
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE financial_data_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_dcf_models_updated_at BEFORE UPDATE ON dcf_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dcf_scenarios_updated_at BEFORE UPDATE ON dcf_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_templates_updated_at BEFORE UPDATE ON financial_data_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. Create views
-- =====================================================

-- Create view for user models with scenarios count
CREATE VIEW user_models_with_scenarios AS
SELECT 
  m.*,
  COUNT(s.id) as scenario_count,
  MAX(s.updated_at) as last_scenario_update
FROM dcf_models m
LEFT JOIN dcf_scenarios s ON m.id = s.model_id
GROUP BY m.id;

-- Create view for user accessible models
CREATE VIEW user_accessible_models AS
SELECT DISTINCT
  m.*,
  CASE 
    WHEN m.user_id = auth.uid() THEN 'owner'
    WHEN s.can_edit = true THEN 'editor'
    WHEN s.can_view = true THEN 'viewer'
    ELSE 'none'
  END as access_level
FROM dcf_models m
LEFT JOIN dcf_model_shares s ON m.id = s.model_id
WHERE 
  m.user_id = auth.uid() OR
  (s.shared_with_user_id = auth.uid() AND s.is_active = true AND (s.expires_at IS NULL OR s.expires_at > NOW())) OR
  (m.is_public = true);

-- Create view for model statistics
CREATE VIEW dcf_model_stats AS
SELECT 
  m.id,
  m.model_name,
  m.user_id,
  m.created_at,
  m.updated_at,
  COUNT(s.id) as total_scenarios,
  COUNT(v.id) as total_versions,
  MAX(v.created_at) as last_version_created,
  COUNT(sh.id) as total_shares
FROM dcf_models m
LEFT JOIN dcf_scenarios s ON m.id = s.model_id
LEFT JOIN dcf_model_versions v ON m.id = v.model_id
LEFT JOIN dcf_model_shares sh ON m.id = sh.model_id
GROUP BY m.id, m.model_name, m.user_id, m.created_at, m.updated_at;

-- =====================================================
-- 8. Insert sample data (optional)
-- =====================================================

-- Insert some sample financial templates
INSERT INTO financial_data_templates (
  template_name,
  description,
  category,
  ebitda_data,
  base_currency,
  default_discount_rate,
  default_perpetuity_rate,
  default_corporate_tax_rate,
  is_public,
  is_system_template,
  tags
) VALUES 
(
  'Tech Startup Template',
  'Template for early-stage technology startups',
  'industry',
  '{"2024": 1000000, "2025": 1500000, "2026": 2500000, "2027": 4000000, "2028": 6000000, "2029": 9000000}',
  'USD',
  20.0,
  4.0,
  25.0,
  true,
  true,
  ARRAY['startup', 'technology', 'high-growth']
),
(
  'Manufacturing Company Template',
  'Template for established manufacturing companies',
  'industry',
  '{"2024": 5000000, "2025": 5200000, "2026": 5400000, "2027": 5600000, "2028": 5800000, "2029": 6000000}',
  'EUR',
  12.0,
  2.5,
  30.0,
  true,
  true,
  ARRAY['manufacturing', 'established', 'stable']
),
(
  'SaaS Company Template',
  'Template for software-as-a-service companies',
  'industry',
  '{"2024": 2000000, "2025": 3000000, "2026": 4500000, "2027": 6750000, "2028": 10125000, "2029": 15187500}',
  'USD',
  15.0,
  3.0,
  25.0,
  true,
  true,
  ARRAY['saas', 'software', 'recurring-revenue']
);

-- =====================================================
-- Migration Complete!
-- =====================================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('dcf_models', 'dcf_scenarios', 'dcf_model_shares', 'dcf_model_versions', 'financial_data_templates')
ORDER BY tablename;