
import { createClient } from '@supabase/supabase-js';
import { Protocol } from '../types';

// Função auxiliar para pegar variáveis de ambiente de forma segura
const getEnv = (key: string) => {
  return (window as any).process?.env?.[key] || (process as any)?.env?.[key] || "";
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const dbService = {
  isConnected(): boolean {
    return !!supabase;
  },

  async getProtocols(): Promise<Protocol[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Protocol[] || [];
    } catch (e) {
      console.error('Erro Supabase:', e);
      return [];
    }
  },

  async saveProtocol(protocol: Protocol) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    const { error } = await supabase
      .from('protocols')
      .upsert({
        id: protocol.id,
        title: protocol.title,
        description: protocol.description,
        duration: protocol.duration,
        premium: protocol.premium,
        audioUrl: protocol.audioUrl
      });
    
    if (error) throw error;
  },

  async deleteProtocol(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    const { error } = await supabase.from('protocols').delete().eq('id', id);
    if (error) throw error;
  },

  async seedDatabase(initialProtocols: Protocol[]) {
    if (!supabase) return;
    for (const p of initialProtocols) {
      await this.saveProtocol(p);
    }
  }
};
