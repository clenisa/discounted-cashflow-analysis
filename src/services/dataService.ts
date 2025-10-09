import type { SupabaseClient } from '@supabase/supabase-js';
import type { DCFModel } from '@/types/dcf';

export interface DataService {
  saveModel(model: DCFModel): Promise<string>;
  loadModel(id: string): Promise<DCFModel | null>;
  listModels(): Promise<DCFModel[]>;
  deleteModel(id: string): Promise<void>;
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
}

export class SupabaseDataService implements DataService {
  constructor(private readonly supabase: SupabaseClient) {}

  async saveModel(model: DCFModel): Promise<string> {
    const { data, error } = await this.supabase
      .from('dcf_models')
      .upsert(model)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  async loadModel(id: string): Promise<DCFModel | null> {
    const { data, error } = await this.supabase.from('dcf_models').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  async listModels(): Promise<DCFModel[]> {
    const { data, error } = await this.supabase
      .from('dcf_models')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async deleteModel(id: string): Promise<void> {
    const { error } = await this.supabase.from('dcf_models').delete().eq('id', id);

    if (error) {
      throw error;
    }
  }
}
