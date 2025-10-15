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

-- Create trigger for auto-versioning (optional - can be enabled later)
-- CREATE TRIGGER dcf_models_version_trigger AFTER UPDATE ON dcf_models
--   FOR EACH ROW EXECUTE FUNCTION create_model_version();