
import React, { useState } from 'react';
import { Protocol } from '../types';
import { dbService } from '../services/dbService';
import { PROTOCOLS as STATIC_PROTOCOLS } from '../constants';

interface AdminViewProps {
  protocols: Protocol[];
  onRefresh: () => void;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ protocols, onRefresh, onBack }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Protocol>>({});
  const [loading, setLoading] = useState(false);
  
  const isConnected = dbService.isConnected();

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

  const handleSave = async () => {
    if (!formData.title || !formData.id) return;
    setLoading(true);
    try {
      await dbService.saveProtocol(formData as Protocol);
      onRefresh();
      setEditingId(null);
    } catch (e) {
      alert('Erro ao salvar. Verifique se a tabela "protocols" existe no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (confirm('Deseja carregar os protocolos padrão para o banco de dados?')) {
      setLoading(true);
      try {
        await dbService.seedDatabase(STATIC_PROTOCOLS);
        onRefresh();
        alert('Banco de dados sincronizado com sucesso!');
      } catch (e) {
        alert('Erro ao sincronizar.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir permanentemente?')) {
      setLoading(true);
      try {
        await dbService.deleteProtocol(id);
        onRefresh();
      } catch (e) {
        alert('Erro ao excluir.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="serif text-3xl">Painel de Controle</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
              {isConnected ? 'Supabase Conectado' : 'Supabase Desconectado'}
            </p>
          </div>
        </div>
        <button onClick={onBack} className="text-stone-400 hover:text-stone-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Atenção:</strong> As variáveis de ambiente não foram detectadas. Certifique-se de que <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> estão configuradas na Vercel.
          </p>
        </div>
      )}

      {editingId ? (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm relative">
          {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center font-medium">Processando...</div>}
          <h3 className="serif text-xl mb-4">{editingId === 'new' ? 'Novo Protocolo' : 'Editar Protocolo'}</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-stone-400">Título</label>
            <input className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-stone-400">Descrição</label>
            <textarea className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-stone-400">Duração</label>
              <input className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
            </div>
            <div className="flex flex-col justify-end pb-3">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-stone-300" checked={formData.premium} onChange={e => setFormData({...formData, premium: e.target.checked})} />
                <span className="ml-2 text-sm text-stone-600">Premium</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-stone-400">URL do Áudio (.mp3)</label>
            <input className="w-full p-3 bg-stone-50 rounded-xl border border-stone-100 outline-none" value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="flex-1 py-3 bg-stone-800 text-white rounded-xl font-medium shadow-md">Salvar</button>
            <button onClick={() => setEditingId(null)} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button 
              onClick={handleAddNew}
              className="flex-1 py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs font-bold uppercase tracking-wider hover:border-stone-400 hover:text-stone-600 transition-all"
            >
              + Novo
            </button>
            {protocols.length === STATIC_PROTOCOLS.length && isConnected && (
               <button 
                onClick={handleSeed}
                className="px-4 border-2 border-stone-800 rounded-2xl text-stone-800 text-[10px] font-bold uppercase tracking-wider hover:bg-stone-800 hover:text-white transition-all"
               >
                 Sincronizar
               </button>
            )}
          </div>

          <div className="space-y-3">
            {protocols.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between group">
                <div className="flex-1 mr-4">
                  <div className="flex items-center">
                    <h4 className="font-medium text-stone-800">{p.title}</h4>
                    {p.premium && <span className="ml-2 text-[8px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-bold uppercase">Pago</span>}
                  </div>
                  <p className="text-[10px] text-stone-400 font-light truncate max-w-[180px]">{p.description}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(p)} className="text-[10px] font-bold text-stone-400 hover:text-stone-800 uppercase tracking-tighter">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[10px] font-bold text-red-300 hover:text-red-500 uppercase tracking-tighter">Apagar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
