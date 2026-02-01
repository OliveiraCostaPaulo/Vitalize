
import React, { useState, useRef } from 'react';
import { Protocol } from '../types';
import { upsertProtocol, deleteProtocolFromDb, uploadAudioFile } from '../services/supabaseClient';

interface AdminViewProps {
  protocols: Protocol[];
  onSave: (protocols: Protocol[]) => void;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ protocols, onSave, onBack }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Protocol>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (p: Protocol) => {
    setEditingId(p.id);
    setFormData(p);
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      id: `protocol-${Date.now()}`,
      title: '',
      description: '',
      duration: '0:00',
      premium: false,
      audioUrl: ''
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar se é áudio
    if (!file.type.startsWith('audio/')) {
      alert("Por favor, selecione um arquivo de áudio válido (MP3, WAV, etc).");
      return;
    }

    setIsUploading(true);
    const publicUrl = await uploadAudioFile(file);
    
    if (publicUrl) {
      setFormData(prev => ({ ...prev, audioUrl: publicUrl }));
    } else {
      alert("Falha ao subir arquivo para o servidor.");
    }
    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.id) return;
    setIsSaving(true);

    const success = await upsertProtocol(formData);
    
    if (success) {
      let newProtocols: Protocol[];
      if (editingId === 'new') {
        newProtocols = [...protocols, formData as Protocol];
      } else {
        newProtocols = protocols.map(p => p.id === editingId ? (formData as Protocol) : p);
      }
      onSave(newProtocols);
      setEditingId(null);
    } else {
      alert("Erro ao salvar no banco de dados. Verifique sua conexão.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este protocolo?')) {
      const success = await deleteProtocolFromDb(id);
      if (success) {
        onSave(protocols.filter(p => p.id !== id));
      } else {
        alert("Erro ao deletar do banco de dados.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="serif text-3xl">Gerenciar Conteúdo</h2>
        <button onClick={onBack} className="text-stone-400 hover:text-stone-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {editingId ? (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm">
          <h3 className="serif text-xl mb-4">{editingId === 'new' ? 'Novo Protocolo' : 'Editar Protocolo'}</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-stone-400">Título</label>
            <input 
              className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 focus:ring-1 focus:ring-stone-400 outline-none"
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-stone-400">Descrição Curta</label>
            <textarea 
              className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 focus:ring-1 focus:ring-stone-400 outline-none"
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-stone-400">Duração (ex: 5:40)</label>
              <input 
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 focus:ring-1 focus:ring-stone-400 outline-none"
                value={formData.duration} 
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
            <div className="flex flex-col justify-end pb-3">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
                  checked={formData.premium}
                  onChange={e => setFormData({...formData, premium: e.target.checked})}
                />
                <span className="ml-2 text-sm text-stone-600">Acesso Premium</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-stone-400 block">Arquivo de Áudio</label>
            
            <input 
              type="file" 
              accept="audio/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm font-medium border border-stone-200 hover:bg-stone-200 transition-colors ${isUploading ? 'opacity-50' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                {isUploading ? 'Subindo...' : 'Subir MP3'}
              </button>
              
              <input 
                className="flex-1 p-2 bg-stone-50 rounded-lg border border-stone-100 text-[10px] text-stone-400 italic outline-none"
                placeholder="Ou cole a URL aqui..."
                value={formData.audioUrl} 
                onChange={e => setFormData({...formData, audioUrl: e.target.value})}
              />
            </div>
            {formData.audioUrl && !isUploading && (
              <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Áudio vinculado com sucesso.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={handleSave} 
              disabled={isSaving || isUploading}
              className={`flex-1 py-3 bg-stone-800 text-white rounded-xl font-medium shadow-md ${(isSaving || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Salvando...' : 'Salvar Protocolo'}
            </button>
            <button 
              onClick={() => setEditingId(null)} 
              disabled={isSaving || isUploading}
              className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={handleAddNew}
            className="w-full py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo Protocolo
          </button>

          <div className="space-y-3">
            {protocols.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between group">
                <div className="flex-1 mr-4">
                  <div className="flex items-center">
                    <h4 className="font-medium text-stone-800">{p.title}</h4>
                    {p.premium && <span className="ml-2 text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase font-bold">Premium</span>}
                  </div>
                  <p className="text-xs text-stone-400 font-light truncate max-w-[180px]">{p.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 text-stone-400 hover:text-stone-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-stone-400 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
