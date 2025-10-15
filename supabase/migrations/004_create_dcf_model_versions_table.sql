-- Create dcf_model_versions table
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

-- Create indexes
CREATE INDEX idx_dcf_model_versions_model_id ON dcf_model_versions(model_id);
CREATE INDEX idx_dcf_model_versions_created_at ON dcf_model_versions(model_id, created_at DESC);

-- Enable RLS
ALTER TABLE dcf_model_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view versions of their models" ON dcf_model_versions
  FOR SELECT USING (
    model_id IN (SELECT id FROM dcf_models WHERE user_id = auth.uid()) OR
    model_id IN (SELECT model_id FROM dcf_model_shares WHERE shared_with_user_id = auth.uid() AND can_view = true)
  );