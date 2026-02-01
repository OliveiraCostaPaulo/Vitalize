
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmbbhlgmtwfhpiknqmjk.supabase.co';
const supabaseKey = 'sb_publishable_R5dhA_YpyUgfN3UgtRutOw_mFAHPvDA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- AUTH FUNCTIONS ---

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Perfil não existe, vamos criar um inicial (Free)
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ id: userId, is_premium: false })
        .select()
        .single();
      
      if (createError) throw createError;
      return newProfile;
    }
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return { is_premium: false };
  }
}

export async function updateProfilePremium(userId: string, isPremium: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_premium: isPremium })
    .eq('id', userId);
  
  if (error) throw error;
  return true;
}

// --- DATA FUNCTIONS ---

export async function fetchProtocols() {
  try {
    const { data, error } = await supabase
      .from('protocols')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase: Erro ao buscar protocolos.", err);
    return null;
  }
}

export async function upsertProtocol(protocol: any) {
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
}

export async function deleteProtocolFromDb(id: string) {
  const { error } = await supabase
    .from('protocols')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function saveCheckIn(checkIn: { body: string, emotion: string, energy: string }, userId?: string) {
  try {
    const { error } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
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

export async function uploadAudioFile(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `protocols/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('audio-protocols')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('audio-protocols')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("Supabase Storage: Erro no upload.", err);
    return null;
  }
}
