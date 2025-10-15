import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  DCFModel, 
  DCFScenario, 
  DCFModelShare, 
  DCFModelVersion, 
  FinancialDataTemplate,
  DCFModelWithScenarios,
  DCFModelWithAccess,
  DCFModelStats,
  SharingPermissions
} from '@/types/dcf';

export interface DataService {
  // Model operations
  saveModel(model: DCFModel): Promise<string>;
  loadModel(id: string): Promise<DCFModel | null>;
  listModels(): Promise<DCFModel[]>;
  deleteModel(id: string): Promise<void>;
  
  // Scenario operations
  saveScenario(scenario: DCFScenario): Promise<string>;
  loadScenario(id: string): Promise<DCFScenario | null>;
  listScenarios(modelId: string): Promise<DCFScenario[]>;
  deleteScenario(id: string): Promise<void>;
  reorderScenarios(modelId: string, scenarioIds: string[]): Promise<void>;
  
  // Sharing operations
  shareModel(modelId: string, shareData: Partial<DCFModelShare>): Promise<string>;
  updateSharePermissions(shareId: string, permissions: SharingPermissions): Promise<void>;
  revokeShare(shareId: string): Promise<void>;
  listSharedModels(): Promise<DCFModelWithAccess[]>;
  listModelShares(modelId: string): Promise<DCFModelShare[]>;
  
  // Template operations
  saveTemplate(template: FinancialDataTemplate): Promise<string>;
  loadTemplate(id: string): Promise<FinancialDataTemplate | null>;
  listTemplates(category?: string): Promise<FinancialDataTemplate[]>;
  deleteTemplate(id: string): Promise<void>;
  incrementTemplateUsage(templateId: string): Promise<void>;
  
  // Version operations
  createModelVersion(modelId: string, changeSummary?: string, changeType?: string): Promise<string>;
  listModelVersions(modelId: string): Promise<DCFModelVersion[]>;
  loadModelVersion(versionId: string): Promise<DCFModelVersion | null>;
  restoreModelFromVersion(modelId: string, versionId: string): Promise<void>;
  
  // Statistics and analytics
  getModelStats(modelId: string): Promise<DCFModelStats | null>;
  getUserModelStats(): Promise<DCFModelStats[]>;
}

export class LocalDataService implements DataService {
  async saveModel(model: DCFModel): Promise<string> {
    const id = model.id ?? crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const modelWithMetadata: DCFModel = {
      ...model,
      id,
      updatedAt: timestamp,
      createdAt: model.createdAt ?? timestamp
    };

    localStorage.setItem(`dcf_model_${id}`, JSON.stringify(modelWithMetadata));
    return id;
  }

  async loadModel(id: string): Promise<DCFModel | null> {
    const data = localStorage.getItem(`dcf_model_${id}`);
    return data ? (JSON.parse(data) as DCFModel) : null;
  }

  async listModels(): Promise<DCFModel[]> {
    const models: DCFModel[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith('dcf_model_')) continue;
      const model = localStorage.getItem(key);
      if (model) {
        models.push(JSON.parse(model) as DCFModel);
      }
    }
    return models.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  }

  async deleteModel(id: string): Promise<void> {
    localStorage.removeItem(`dcf_model_${id}`);
  }

  // Stub implementations for new interface methods
  async saveScenario(scenario: DCFScenario): Promise<string> {
    throw new Error('LocalDataService does not support scenarios. Use SupabaseDataService.');
  }

  async loadScenario(id: string): Promise<DCFScenario | null> {
    throw new Error('LocalDataService does not support scenarios. Use SupabaseDataService.');
  }

  async listScenarios(modelId: string): Promise<DCFScenario[]> {
    throw new Error('LocalDataService does not support scenarios. Use SupabaseDataService.');
  }

  async deleteScenario(id: string): Promise<void> {
    throw new Error('LocalDataService does not support scenarios. Use SupabaseDataService.');
  }

  async reorderScenarios(modelId: string, scenarioIds: string[]): Promise<void> {
    throw new Error('LocalDataService does not support scenarios. Use SupabaseDataService.');
  }

  async shareModel(modelId: string, shareData: Partial<DCFModelShare>): Promise<string> {
    throw new Error('LocalDataService does not support sharing. Use SupabaseDataService.');
  }

  async updateSharePermissions(shareId: string, permissions: SharingPermissions): Promise<void> {
    throw new Error('LocalDataService does not support sharing. Use SupabaseDataService.');
  }

  async revokeShare(shareId: string): Promise<void> {
    throw new Error('LocalDataService does not support sharing. Use SupabaseDataService.');
  }

  async listSharedModels(): Promise<DCFModelWithAccess[]> {
    throw new Error('LocalDataService does not support sharing. Use SupabaseDataService.');
  }

  async listModelShares(modelId: string): Promise<DCFModelShare[]> {
    throw new Error('LocalDataService does not support sharing. Use SupabaseDataService.');
  }

  async saveTemplate(template: FinancialDataTemplate): Promise<string> {
    throw new Error('LocalDataService does not support templates. Use SupabaseDataService.');
  }

  async loadTemplate(id: string): Promise<FinancialDataTemplate | null> {
    throw new Error('LocalDataService does not support templates. Use SupabaseDataService.');
  }

  async listTemplates(category?: string): Promise<FinancialDataTemplate[]> {
    throw new Error('LocalDataService does not support templates. Use SupabaseDataService.');
  }

  async deleteTemplate(id: string): Promise<void> {
    throw new Error('LocalDataService does not support templates. Use SupabaseDataService.');
  }

  async incrementTemplateUsage(templateId: string): Promise<void> {
    throw new Error('LocalDataService does not support templates. Use SupabaseDataService.');
  }

  async createModelVersion(modelId: string, changeSummary?: string, changeType?: string): Promise<string> {
    throw new Error('LocalDataService does not support versioning. Use SupabaseDataService.');
  }

  async listModelVersions(modelId: string): Promise<DCFModelVersion[]> {
    throw new Error('LocalDataService does not support versioning. Use SupabaseDataService.');
  }

  async loadModelVersion(versionId: string): Promise<DCFModelVersion | null> {
    throw new Error('LocalDataService does not support versioning. Use SupabaseDataService.');
  }

  async restoreModelFromVersion(modelId: string, versionId: string): Promise<void> {
    throw new Error('LocalDataService does not support versioning. Use SupabaseDataService.');
  }

  async getModelStats(modelId: string): Promise<DCFModelStats | null> {
    throw new Error('LocalDataService does not support statistics. Use SupabaseDataService.');
  }

  async getUserModelStats(): Promise<DCFModelStats[]> {
    throw new Error('LocalDataService does not support statistics. Use SupabaseDataService.');
  }
}

export class SupabaseDataService implements DataService {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  // Model operations
  async saveModel(model: DCFModel): Promise<string> {
    const { data, error } = await this.supabaseClient
      .from('dcf_models')
      .upsert({
        ...model,
        user_id: model.userId,
        model_name: model.modelName,
        company_name: model.companyName,
        discount_rate: model.discountRate,
        perpetuity_rate: model.perpetuityRate,
        corporate_tax_rate: model.corporateTaxRate,
        ebitda_data: model.ebitdaData,
        income_statement_data: model.incomeStatementData,
        income_statement_adjustments: model.incomeStatementAdjustments,
        fiscal_year_labels: model.fiscalYearLabels,
        use_income_statement: model.useIncomeStatement,
        base_currency: model.baseCurrency,
        enterprise_value: model.enterpriseValue,
        terminal_value: model.terminalValue,
        terminal_value_pv: model.terminalValuePV,
        projections_pv: model.projectionsPV,
        present_values: model.presentValues,
        is_template: model.isTemplate,
        is_public: model.isPublic,
        tags: model.tags,
        created_at: model.createdAt,
        updated_at: model.updatedAt
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  async loadModel(id: string): Promise<DCFModel | null> {
    const { data, error } = await this.supabaseClient
      .from('dcf_models')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return this.mapDbModelToDCFModel(data);
  }

  async listModels(): Promise<DCFModel[]> {
    const { data, error } = await this.supabaseClient
      .from('dcf_models')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(this.mapDbModelToDCFModel);
  }

  async deleteModel(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('dcf_models')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // Scenario operations
  async saveScenario(scenario: DCFScenario): Promise<string> {
    const { data, error } = await this.supabaseClient
      .from('dcf_scenarios')
      .upsert({
        ...scenario,
        user_id: scenario.userId,
        model_id: scenario.modelId,
        scenario_name: scenario.scenarioName,
        discount_rate: scenario.discountRate,
        perpetuity_rate: scenario.perpetuityRate,
        corporate_tax_rate: scenario.corporateTaxRate,
        ebitda_data: scenario.ebitdaData,
        income_statement_data: scenario.incomeStatementData,
        income_statement_adjustments: scenario.incomeStatementAdjustments,
        enterprise_value: scenario.enterpriseValue,
        terminal_value: scenario.terminalValue,
        terminal_value_pv: scenario.terminalValuePV,
        projections_pv: scenario.projectionsPV,
        present_values: scenario.presentValues,
        is_base_scenario: scenario.isBaseScenario,
        sort_order: scenario.sortOrder,
        created_at: scenario.createdAt,
        updated_at: scenario.updatedAt
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  async loadScenario(id: string): Promise<DCFScenario | null> {
    const { data, error } = await this.supabaseClient
      .from('dcf_scenarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return this.mapDbScenarioToDCFScenario(data);
  }

  async listScenarios(modelId: string): Promise<DCFScenario[]> {
    const { data, error } = await this.supabaseClient
      .from('dcf_scenarios')
      .select('*')
      .eq('model_id', modelId)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(this.mapDbScenarioToDCFScenario);
  }

  async deleteScenario(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('dcf_scenarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  async reorderScenarios(modelId: string, scenarioIds: string[]): Promise<void> {
    const updates = scenarioIds.map((id, index) => ({
      id,
      sort_order: index
    }));

    const { error } = await this.supabaseClient
      .from('dcf_scenarios')
      .upsert(updates);

    if (error) {
      throw error;
    }
  }

  // Sharing operations
  async shareModel(modelId: string, shareData: Partial<DCFModelShare>): Promise<string> {
    const { data, error } = await this.supabaseClient
      .from('dcf_model_shares')
      .insert({
        model_id: modelId,
        shared_by_user_id: shareData.sharedByUserId,
        shared_with_user_id: shareData.sharedWithUserId,
        shared_with_email: shareData.sharedWithEmail,
        can_view: shareData.canView ?? true,
        can_edit: shareData.canEdit ?? false,
        can_share: shareData.canShare ?? false,
        can_delete: shareData.canDelete ?? false,
        expires_at: shareData.expiresAt,
        is_active: shareData.isActive ?? true,
        share_token: shareData.shareToken,
        message: shareData.message
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  async updateSharePermissions(shareId: string, permissions: SharingPermissions): Promise<void> {
    const { error } = await this.supabaseClient
      .from('dcf_model_shares')
      .update({
        can_view: permissions.canView,
        can_edit: permissions.canEdit,
        can_share: permissions.canShare,
        can_delete: permissions.canDelete
      })
      .eq('id', shareId);

    if (error) {
      throw error;
    }
  }

  async revokeShare(shareId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('dcf_model_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      throw error;
    }
  }

  async listSharedModels(): Promise<DCFModelWithAccess[]> {
    const { data, error } = await this.supabaseClient
      .from('user_accessible_models')
      .select('*');

    if (error) {
      throw error;
    }

    return (data ?? []).map(this.mapDbModelToDCFModelWithAccess);
  }

  async listModelShares(modelId: string): Promise<DCFModelShare[]> {
    const { data, error } = await this.supabaseClient
      .from('dcf_model_shares')
      .select('*')
      .eq('model_id', modelId);

    if (error) {
      throw error;
    }

    return (data ?? []).map(this.mapDbShareToDCFModelShare);
  }

  // Template operations
  async saveTemplate(template: FinancialDataTemplate): Promise<string> {
    const { data, error } = await this.supabaseClient
      .from('financial_data_templates')
      .upsert({
        ...template,
        created_by_user_id: template.createdByUserId,
        template_name: template.templateName,
        ebitda_data: template.ebitdaData,
        income_statement_data: template.incomeStatementData,
        fiscal_year_labels: template.fiscalYearLabels,
        base_currency: template.baseCurrency,
        default_discount_rate: template.defaultDiscountRate,
        default_perpetuity_rate: template.defaultPerpetuityRate,
        default_corporate_tax_rate: template.defaultCorporateTaxRate,
        is_public: template.isPublic,
        is_system_template: template.isSystemTemplate,
        tags: template.tags,
        usage_count: template.usageCount,
        created_at: template.createdAt,
        updated_at: template.updatedAt
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  async loadTemplate(id: string): Promise<FinancialDataTemplate | null> {
    const { data, error } = await this.supabaseClient
      .from('financial_data_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return this.mapDbTemplateToFinancialDataTemplate(data);
  }

  async listTemplates(category?: string): Promise<FinancialDataTemplate[]> {
    let query = this.supabaseClient
      .from('financial_data_templates')
      .select('*')
      .order('usage_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []).map(this.mapDbTemplateToFinancialDataTemplate);
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('financial_data_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  async incrementTemplateUsage(templateId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .rpc('increment_template_usage', { template_id: templateId });

    if (error) {
      throw error;
    }
  }

  // Version operations
  async createModelVersion(modelId: string, changeSummary?: string, changeType?: string): Promise<string> {
    const { data, error } = await this.supabaseClient
      .from('dcf_model_versions')
      .insert({
        model_id: modelId,
        change_summary: changeSummary,
        change_type: changeType ?? 'manual'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  async listModelVersions(modelId: string): Promise<DCFModelVersion[]> {
    const { data, error } = await this.supabaseClient
      .from('dcf_model_versions')
      .select('*')
      .eq('model_id', modelId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(this.mapDbVersionToDCFModelVersion);
  }

  async loadModelVersion(versionId: string): Promise<DCFModelVersion | null> {
    const { data, error } = await this.supabaseClient
      .from('dcf_model_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return this.mapDbVersionToDCFModelVersion(data);
  }

  async restoreModelFromVersion(modelId: string, versionId: string): Promise<void> {
    const version = await this.loadModelVersion(versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    const modelData = version.modelData;
    await this.saveModel({
      ...modelData,
      id: modelId
    });
  }

  // Statistics and analytics
  async getModelStats(modelId: string): Promise<DCFModelStats | null> {
    const { data, error } = await this.supabaseClient
      .from('dcf_model_stats')
      .select('*')
      .eq('id', modelId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return this.mapDbStatsToDCFModelStats(data);
  }

  async getUserModelStats(): Promise<DCFModelStats[]> {
    const { data, error } = await this.supabaseClient
      .from('dcf_model_stats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(this.mapDbStatsToDCFModelStats);
  }

  // Helper methods for mapping database records to TypeScript interfaces
  private mapDbModelToDCFModel(dbModel: any): DCFModel {
    return {
      id: dbModel.id,
      userId: dbModel.user_id,
      modelName: dbModel.model_name,
      companyName: dbModel.company_name,
      description: dbModel.description,
      discountRate: dbModel.discount_rate,
      perpetuityRate: dbModel.perpetuity_rate,
      corporateTaxRate: dbModel.corporate_tax_rate,
      ebitdaData: dbModel.ebitda_data,
      incomeStatementData: dbModel.income_statement_data,
      incomeStatementAdjustments: dbModel.income_statement_adjustments,
      fiscalYearLabels: dbModel.fiscal_year_labels,
      useIncomeStatement: dbModel.use_income_statement,
      baseCurrency: dbModel.base_currency,
      enterpriseValue: dbModel.enterprise_value,
      terminalValue: dbModel.terminal_value,
      terminalValuePV: dbModel.terminal_value_pv,
      projectionsPV: dbModel.projections_pv,
      presentValues: dbModel.present_values,
      isTemplate: dbModel.is_template,
      isPublic: dbModel.is_public,
      tags: dbModel.tags,
      createdAt: dbModel.created_at,
      updatedAt: dbModel.updated_at
    };
  }

  private mapDbScenarioToDCFScenario(dbScenario: any): DCFScenario {
    return {
      id: dbScenario.id,
      userId: dbScenario.user_id,
      modelId: dbScenario.model_id,
      scenarioName: dbScenario.scenario_name,
      description: dbScenario.description,
      discountRate: dbScenario.discount_rate,
      perpetuityRate: dbScenario.perpetuity_rate,
      corporateTaxRate: dbScenario.corporate_tax_rate,
      ebitdaData: dbScenario.ebitda_data,
      incomeStatementData: dbScenario.income_statement_data,
      incomeStatementAdjustments: dbScenario.income_statement_adjustments,
      enterpriseValue: dbScenario.enterprise_value,
      terminalValue: dbScenario.terminal_value,
      terminalValuePV: dbScenario.terminal_value_pv,
      projectionsPV: dbScenario.projections_pv,
      presentValues: dbScenario.present_values,
      isBaseScenario: dbScenario.is_base_scenario,
      sortOrder: dbScenario.sort_order,
      createdAt: dbScenario.created_at,
      updatedAt: dbScenario.updated_at
    };
  }

  private mapDbShareToDCFModelShare(dbShare: any): DCFModelShare {
    return {
      id: dbShare.id,
      modelId: dbShare.model_id,
      sharedByUserId: dbShare.shared_by_user_id,
      sharedWithUserId: dbShare.shared_with_user_id,
      sharedWithEmail: dbShare.shared_with_email,
      canView: dbShare.can_view,
      canEdit: dbShare.can_edit,
      canShare: dbShare.can_share,
      canDelete: dbShare.can_delete,
      expiresAt: dbShare.expires_at,
      isActive: dbShare.is_active,
      shareToken: dbShare.share_token,
      message: dbShare.message,
      createdAt: dbShare.created_at,
      lastAccessedAt: dbShare.last_accessed_at
    };
  }

  private mapDbTemplateToFinancialDataTemplate(dbTemplate: any): FinancialDataTemplate {
    return {
      id: dbTemplate.id,
      createdByUserId: dbTemplate.created_by_user_id,
      templateName: dbTemplate.template_name,
      description: dbTemplate.description,
      category: dbTemplate.category,
      ebitdaData: dbTemplate.ebitda_data,
      incomeStatementData: dbTemplate.income_statement_data,
      fiscalYearLabels: dbTemplate.fiscal_year_labels,
      baseCurrency: dbTemplate.base_currency,
      defaultDiscountRate: dbTemplate.default_discount_rate,
      defaultPerpetuityRate: dbTemplate.default_perpetuity_rate,
      defaultCorporateTaxRate: dbTemplate.default_corporate_tax_rate,
      isPublic: dbTemplate.is_public,
      isSystemTemplate: dbTemplate.is_system_template,
      tags: dbTemplate.tags,
      usageCount: dbTemplate.usage_count,
      createdAt: dbTemplate.created_at,
      updatedAt: dbTemplate.updated_at
    };
  }

  private mapDbVersionToDCFModelVersion(dbVersion: any): DCFModelVersion {
    return {
      id: dbVersion.id,
      modelId: dbVersion.model_id,
      versionNumber: dbVersion.version_number,
      createdByUserId: dbVersion.created_by_user_id,
      modelData: this.mapDbModelToDCFModel(dbVersion.model_data),
      changeSummary: dbVersion.change_summary,
      changeType: dbVersion.change_type,
      createdAt: dbVersion.created_at
    };
  }

  private mapDbModelToDCFModelWithAccess(dbModel: any): DCFModelWithAccess {
    return {
      ...this.mapDbModelToDCFModel(dbModel),
      accessLevel: dbModel.access_level
    };
  }

  private mapDbStatsToDCFModelStats(dbStats: any): DCFModelStats {
    return {
      id: dbStats.id,
      modelName: dbStats.model_name,
      userId: dbStats.user_id,
      createdAt: dbStats.created_at,
      updatedAt: dbStats.updated_at,
      totalScenarios: dbStats.total_scenarios,
      totalVersions: dbStats.total_versions,
      lastVersionCreated: dbStats.last_version_created,
      totalShares: dbStats.total_shares
    };
  }
}
