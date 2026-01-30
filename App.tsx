
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { CheckInForm } from './components/CheckInForm';
import { ProtocolPlayer } from './components/ProtocolPlayer';
import { PremiumModal } from './components/PremiumModal';
import { AdminView } from './components/AdminView';
import { AppState, UserCheckIn, Protocol } from './types';
import { ANCHOR_PHRASES, PROTOCOLS as STATIC_PROTOCOLS } from './constants';
import { getProtocolSuggestion } from './services/geminiService';
import { fetchProtocols, saveCheckIn } from './services/supabaseClient';

const INITIAL_STATE: AppState = {
  isLoggedIn: false,
  isPremium: false,
  lastCheckIn: null,
  dailyCheckInDone: false,
  checkInCount: 0
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [view, setView] = useState<'landing' | 'onboarding' | 'checkin' | 'dashboard' | 'protocol' | 'admin'>('landing');
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [suggestion, setSuggestion] = useState<{ protocolId: string; reason: string } | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [protocols, setProtocols] = useState<Protocol[]>(STATIC_PROTOCOLS);

  useEffect(() => {
    async function initData() {
      // 1. Verificar acesso administrativo via URL (?curador=true ou #admin)
      const params = new URLSearchParams(window.location.search);
      const isCuradorParam = params.get('curador') === 'true';
      const isCuradorHash = window.location.hash === '#admin';
      
      if (isCuradorParam || isCuradorHash) {
        setView('admin');
        // Limpar a URL para não ficar óbvio
        window.history.replaceState({}, '', window.location.pathname);
      }

      // 2. Carregar protocolos do banco
      const dbProtocols = await fetchProtocols();
      if (dbProtocols && dbProtocols.length > 0) {
        const mapped = dbProtocols.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          duration: p.duration,
          premium: p.premium,
          audioUrl: p.audio_url || p.audioUrl
        }));
        setProtocols(mapped);
      }
      setIsLoading(false);
    }
    initData();
  }, []);

  const dailyPhrase = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return ANCHOR_PHRASES[dayOfYear % ANCHOR_PHRASES.length];
  }, []);

  const handleLogin = (premium = false) => {
    setAppState(prev => ({ ...prev, isLoggedIn: true, isPremium: premium }));
    setView('dashboard');
  };

  const onCheckInComplete = async (data: UserCheckIn) => {
    if (!appState.isPremium && appState.dailyCheckInDone) {
      setShowPremiumModal(true);
      setView('dashboard');
      return;
    }

    saveCheckIn(data);

    setAppState(prev => ({
      ...prev,
      lastCheckIn: data,
      dailyCheckInDone: true,
      checkInCount: prev.checkInCount + 1
    }));
    
    setIsSuggesting(true);
    setView('dashboard');
    
    const result = await getProtocolSuggestion(data);
    setSuggestion(result);
    setIsSuggesting(false);
  };

  const startProtocol = (protocol: Protocol) => {
    if (protocol.premium && !appState.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setActiveProtocol(protocol);
    setView('protocol');
  };

  const handleUpgrade = () => {
    setAppState(prev => ({ ...prev, isPremium: true }));
    setShowPremiumModal(false);
  };

  const handleSecretAdminTrigger = () => {
    setView('admin');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full text-stone-400">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-light italic">Sincronizando frequências...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogoClick={handleSecretAdminTrigger}>
      {view === 'landing' && (
        <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-1000">
          <div className="mb-12">
            <h2 className="serif text-5xl mb-4 leading-tight">Presença sem esforço.</h2>
            <p className="text-stone-500 font-light max-w-xs mx-auto">
              Regule seu sistema nervoso e recupere seu brilho em minutos.
            </p>
          </div>
          <div className="space-y-4 w-full">
            <button 
              onClick={() => setView('onboarding')}
              className="w-full py-5 rounded-full btn-vitalize text-lg shadow-xl"
            >
              Começar agora
            </button>
            <button 
              onClick={() => handleLogin(true)}
              className="w-full py-3 text-stone-400 text-sm font-medium hover:text-stone-800 transition-colors"
            >
              Já tenho uma conta
            </button>
          </div>
        </div>
      )}

      {view === 'onboarding' && (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="serif text-4xl mb-6 mt-12">Isso não é terapia.</h2>
          <p className="text-stone-500 font-light text-lg mb-8 leading-relaxed">
            É um espaço para seu corpo aprender que é seguro existir. Através de protocolos de 5-10 minutos, mudamos seu estado interno.
          </p>
          <div className="mt-auto pb-12">
             <button 
              onClick={() => handleLogin(false)}
              className="w-full py-5 rounded-full btn-vitalize text-lg shadow-xl"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="animate-in fade-in duration-500 space-y-10">
          <div className="bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3 block">Âncora de hoje</span>
            <p className="serif text-2xl text-stone-800 leading-snug italic">"{dailyPhrase}"</p>
          </div>

          {!appState.lastCheckIn || !suggestion ? (
            <div className="text-center py-8">
               <h3 className="serif text-3xl mb-6">Como você está agora?</h3>
               <button 
                onClick={() => setView('checkin')}
                className="w-20 h-20 rounded-full bg-orange-100/50 flex items-center justify-center mx-auto shadow-inner hover:scale-105 transition-transform"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
               </button>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="serif text-2xl">Sugestão de hoje</h3>
                 <button onClick={() => setView('checkin')} className="text-xs text-stone-400 font-medium hover:text-stone-800">Recalibrar</button>
               </div>
               
               {isSuggesting ? (
                 <div className="h-40 bg-stone-100 rounded-3xl animate-pulse flex items-center justify-center">
                   <span className="text-stone-400 text-sm italic">Ouvindo seu corpo...</span>
                 </div>
               ) : (
                 <div className="bg-stone-800 p-6 rounded-[2rem] text-white shadow-2xl">
                   <p className="text-stone-400 text-sm mb-4 italic font-light">"{suggestion.reason}"</p>
                   {protocols.filter(p => p.id === suggestion.protocolId).map(p => (
                     <div key={p.id} className="flex items-center justify-between">
                       <div>
                         <h4 className="text-lg font-light mb-1">{p.title}</h4>
                         <span className="text-xs text-stone-500">{p.duration}</span>
                       </div>
                       <button 
                        onClick={() => startProtocol(p)}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-stone-900 shadow-lg active:scale-90 transition-transform"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                       </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          <div className="space-y-6">
            <h3 className="serif text-2xl">Explorar Protocolos</h3>
            <div className="space-y-4">
              {protocols.map(p => (
                <button 
                  key={p.id}
                  onClick={() => startProtocol(p)}
                  className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-stone-100 hover:border-stone-200 transition-all text-left group"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium text-stone-800 mr-2">{p.title}</h4>
                      {p.premium && !appState.isPremium && (
                        <span className="text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">Premium</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1 font-light line-clamp-1">{p.description}</p>
                  </div>
                  <div className="text-stone-300 group-hover:text-stone-800 transition-colors ml-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'checkin' && (
        <CheckInForm onComplete={onCheckInComplete} />
      )}

      {view === 'protocol' && activeProtocol && (
        <ProtocolPlayer 
          protocol={activeProtocol} 
          onClose={() => setView('dashboard')} 
        />
      )}

      {view === 'admin' && (
        <AdminView 
          protocols={protocols} 
          onSave={setProtocols} 
          onBack={() => setView('dashboard')} 
        />
      )}

      {showPremiumModal && (
        <PremiumModal 
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </Layout>
  );
}
