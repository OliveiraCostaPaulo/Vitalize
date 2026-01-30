import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmbbhlgmtwfhpiknqmjk.supabase.co';
const supabaseKey = 'sb_publishable_R5dhA_YpyUgfN3UgtRutOw_mFAHPvDA';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchProtocols() {
  try {
    const { data, error } = await supabase
      .from('protocols')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase: Erro ao buscar protocolos, usando locais.", err);
    return null;
  }
}

export async function upsertProtocol(protocol: any) {
  try {
    const { error } = await supabase
      .from('protocols')
      .upsert({
        id: protocol.id,
        title: protocol.title,
        description: protocol.description,
        duration: protocol.duration,
        premium: protocol.premium,
        audio_url: protocol.audioUrl,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase: Erro ao salvar protocolo.", err);
    return false;
  }
}

export async function deleteProtocolFromDb(id: string) {
  try {
    const { error } = await supabase
      .from('protocols')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase: Erro ao deletar protocolo.", err);
    return false;
  }
}

export async function saveCheckIn(checkIn: { body: string, emotion: string, energy: string }) {
  try {
    const { error } = await supabase
      .from('check_ins')
      .insert({
        body_state: checkIn.body,
        emotion_state: checkIn.emotion,
        energy_state: checkIn.energy
      });
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase: Erro ao salvar check-in.", err);
    return false;
  }
}