-- Create dcf_model_shares table
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

-- Create indexes
CREATE INDEX idx_dcf_model_shares_model_id ON dcf_model_shares(model_id);
CREATE INDEX idx_dcf_model_shares_shared_with_user ON dcf_model_shares(shared_with_user_id);
CREATE INDEX idx_dcf_model_shares_share_token ON dcf_model_shares(share_token);
CREATE INDEX idx_dcf_model_shares_expires_at ON dcf_model_shares(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE dcf_model_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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