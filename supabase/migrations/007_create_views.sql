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