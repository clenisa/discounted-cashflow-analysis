# Corporate Finance - Supabase Database Schema Design

## Overview
This document outlines the comprehensive database schema for integrating the DCF (Discounted Cash Flow) analysis tool into the optimal dashboard v2 with Supabase backend support.

## Core Tables

### 1. `dcf_models` - Main DCF Model Storage
```sql
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

-- Indexes
CREATE INDEX idx_dcf_models_user_id ON dcf_models(user_id);
CREATE INDEX idx_dcf_models_created_at ON dcf_models(created_at DESC);
CREATE INDEX idx_dcf_models_is_template ON dcf_models(is_template) WHERE is_template = true;
CREATE INDEX idx_dcf_models_is_public ON dcf_models(is_public) WHERE is_public = true;
CREATE INDEX idx_dcf_models_tags ON dcf_models USING GIN(tags);

-- RLS Policy
ALTER TABLE dcf_models ENABLE ROW LEVEL SECURITY;

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
```

### 2. `dcf_scenarios` - Scenario Management
```sql
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

-- Indexes
CREATE INDEX idx_dcf_scenarios_user_id ON dcf_scenarios(user_id);
CREATE INDEX idx_dcf_scenarios_model_id ON dcf_scenarios(model_id);
CREATE INDEX idx_dcf_scenarios_sort_order ON dcf_scenarios(model_id, sort_order);

-- RLS Policy
ALTER TABLE dcf_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage scenarios for their models" ON dcf_scenarios
  FOR ALL USING (
    auth.uid() = user_id AND 
    model_id IN (SELECT id FROM dcf_models WHERE user_id = auth.uid())
  );
```

### 3. `dcf_model_shares` - Sharing and Collaboration
```sql
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

-- Indexes
CREATE INDEX idx_dcf_model_shares_model_id ON dcf_model_shares(model_id);
CREATE INDEX idx_dcf_model_shares_shared_with_user ON dcf_model_shares(shared_with_user_id);
CREATE INDEX idx_dcf_model_shares_share_token ON dcf_model_shares(share_token);
CREATE INDEX idx_dcf_model_shares_expires_at ON dcf_model_shares(expires_at) WHERE expires_at IS NOT NULL;

-- RLS Policy
ALTER TABLE dcf_model_shares ENABLE ROW LEVEL SECURITY;

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
```

### 4. `dcf_model_versions` - Version History
```sql
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

-- Indexes
CREATE INDEX idx_dcf_model_versions_model_id ON dcf_model_versions(model_id);
CREATE INDEX idx_dcf_model_versions_created_at ON dcf_model_versions(model_id, created_at DESC);

-- RLS Policy
ALTER TABLE dcf_model_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their models" ON dcf_model_versions
  FOR SELECT USING (
    model_id IN (SELECT id FROM dcf_models WHERE user_id = auth.uid()) OR
    model_id IN (SELECT model_id FROM dcf_model_shares WHERE shared_with_user_id = auth.uid() AND can_view = true)
  );
```

### 5. `financial_data_templates` - Reusable Templates
```sql
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

-- Indexes
CREATE INDEX idx_financial_templates_category ON financial_data_templates(category);
CREATE INDEX idx_financial_templates_is_public ON financial_data_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_financial_templates_usage_count ON financial_data_templates(usage_count DESC);
CREATE INDEX idx_financial_templates_tags ON financial_data_templates USING GIN(tags);

-- RLS Policy
ALTER TABLE financial_data_templates ENABLE ROW LEVEL SECURITY;

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
```

## Functions and Triggers

### 1. Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_dcf_models_updated_at BEFORE UPDATE ON dcf_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dcf_scenarios_updated_at BEFORE UPDATE ON dcf_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_templates_updated_at BEFORE UPDATE ON financial_data_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Auto-versioning Trigger
```sql
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

CREATE TRIGGER dcf_models_version_trigger AFTER UPDATE ON dcf_models
  FOR EACH ROW EXECUTE FUNCTION create_model_version();
```

### 3. Usage Tracking Function
```sql
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE financial_data_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$$ language 'plpgsql';
```

## Views for Common Queries

### 1. User Models with Scenarios Count
```sql
CREATE VIEW user_models_with_scenarios AS
SELECT 
  m.*,
  COUNT(s.id) as scenario_count,
  MAX(s.updated_at) as last_scenario_update
FROM dcf_models m
LEFT JOIN dcf_scenarios s ON m.id = s.model_id
GROUP BY m.id;
```

### 2. Shared Models Access
```sql
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
```

## Security Considerations

1. **Row Level Security (RLS)** is enabled on all tables
2. **User isolation** ensures users can only access their own data
3. **Sharing permissions** are granular (view, edit, share, delete)
4. **Token-based sharing** for public access with optional expiration
5. **Audit trail** through version history
6. **Input validation** through CHECK constraints
7. **Index optimization** for common query patterns

## Performance Optimizations

1. **JSONB indexes** for financial data queries
2. **Composite indexes** for common filter combinations
3. **Partial indexes** for boolean flags
4. **GIN indexes** for array operations (tags)
5. **Cached calculations** in main tables to avoid recomputation
6. **Pagination support** through proper ordering

## Migration Strategy

1. Create tables in dependency order
2. Apply RLS policies after table creation
3. Create indexes after data population
4. Add triggers last to avoid conflicts
5. Test with sample data before production deployment