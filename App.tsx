
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { CheckInForm } from './components/CheckInForm';
import { ProtocolPlayer } from './components/ProtocolPlayer';
import { PremiumModal } from './components/PremiumModal';
import { AdminView } from './components/AdminView';
import { AppState, UserCheckIn, Protocol } from './types';
import { ANCHOR_PHRASES, PROTOCOLS as STATIC_PROTOCOLS } from './constants';
import { getProtocolSuggestion } from './services/geminiService';
import { 
  supabase, 
  fetchProtocols, 
  saveCheckIn, 
  signInWithGoogle, 
  signOut, 
  getProfile,
  updateProfilePremium,
  signInWithEmail,
  signUpWithEmail
} from './services/supabaseClient';

const INITIAL_STATE: AppState = {
  isLoggedIn: false,
  isPremium: false,
  lastCheckIn: null,
  dailyCheckInDone: false,
  checkInCount: 0
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'checkin' | 'dashboard' | 'protocol' | 'admin'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [suggestion, setSuggestion] = useState<{ protocolId: string; reason: string } | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [protocols, setProtocols] = useState<Protocol[]>(STATIC_PROTOCOLS);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (session: any) => {
    if (session?.user) {
      setUser(session.user);
      const profile = await getProfile(session.user.id);
      setAppState(prev => ({ 
        ...prev, 
        isLoggedIn: true, 
        isPremium: profile?.is_premium || false 
      }));
      
      if (view === 'landing' || view === 'auth') {
        setView('dashboard');
      }
    } else {
      setUser(null);
      setAppState(INITIAL_STATE);
      if (view !== 'landing') setView('landing');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    async function loadData() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('curador') === 'true') {
        setView('admin');
        window.history.replaceState({}, '', window.location.pathname);
      }

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
    }
    if (appState.isLoggedIn) loadData();
  }, [appState.isLoggedIn]);

  const dailyPhrase = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return ANCHOR_PHRASES[dayOfYear % ANCHOR_PHRASES.length];
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (authMode === 'login') {
        await signInWithEmail(authEmail, authPassword);
      } else {
        await signUpWithEmail(authEmail, authPassword);
        alert("Conta criada com sucesso! Verifique seu e-mail ou faça login.");
        setAuthMode('login');
      }
    } catch (err: any) {
      setAuthError(err.message || "Ocorreu um erro na autenticação.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const onCheckInComplete = async (data: UserCheckIn) => {
    if (!appState.isPremium && appState.dailyCheckInDone) {
      setShowPremiumModal(true);
      setView('dashboard');
      return;
    }

    saveCheckIn(data, user?.id);

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

  const handleUpgrade = async () => {
    if (user) {
      await updateProfilePremium(user.id, true);
      setAppState(prev => ({ ...prev, isPremium: true }));
      setShowPremiumModal(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full text-stone-400">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-light italic">Carregando sua presença...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      onLogoClick={() => setView('admin')} 
      user={user} 
      onLogout={handleLogout}
    >
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
              onClick={() => setView('auth')}
              className="w-full py-5 rounded-full btn-vitalize text-lg shadow-xl"
            >
              Começar agora
            </button>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Baseado em ciência aplicada</p>
          </div>
        </div>
      )}

      {view === 'auth' && (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
          <div className="text-center mb-8">
            <h2 className="serif text-4xl mb-2">{authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
            <p className="text-stone-500 text-sm font-light">
              {authMode === 'login' ? 'Identifique-se para continuar sua jornada.' : 'Comece sua jornada de regulação hoje.'}
            </p>
          </div>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-stone-400 ml-2">E-mail</label>
              <input 
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full p-4 bg-white border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-400 outline-none transition-all"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-stone-400 ml-2">Senha</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-4 bg-white border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-400 outline-none transition-all"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
              />
            </div>

            {authError && (
              <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in zoom-in-95">
                {authError}
              </p>
            )}

            <button 
              type="submit"
              disabled={isAuthLoading}
              className={`w-full py-4 rounded-full btn-vitalize text-lg font-medium shadow-md transition-all active:scale-95 ${isAuthLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAuthLoading ? 'Processando...' : (authMode === 'login' ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-[#F8F7F4] px-4 text-stone-400">Ou acesso rápido</span></div>
          </div>
          
          <button 
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border border-stone-200 rounded-2xl shadow-sm hover:bg-stone-50 transition-all active:scale-95 mb-8"
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="font-medium text-stone-700">Entrar com Google</span>
          </button>

          <div className="text-center mt-auto">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-stone-500 text-sm font-medium hover:text-stone-800 transition-colors"
            >
              {authMode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
            <br />
            <button onClick={() => setView('landing')} className="mt-4 text-stone-400 text-xs hover:text-stone-600">Voltar para o início</button>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="animate-in fade-in duration-500 space-y-10">
          <div className="flex items-center gap-3">
             {user?.user_metadata?.avatar_url ? (
               <img src={user?.user_metadata?.avatar_url} className="w-10 h-10 rounded-full border border-stone-200" alt="Avatar" />
             ) : (
               <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold uppercase">
                 {user?.email?.charAt(0)}
               </div>
             )}
             <div>
               <p className="text-xs text-stone-400 font-light">Bom dia,</p>
               <h4 className="font-medium text-stone-800">
                 {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
               </h4>
             </div>
          </div>

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

          <div className="space-y-6 pb-12">
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

      {view === 'checkin' && <CheckInForm onComplete={onCheckInComplete} />}
      {view === 'protocol' && activeProtocol && <ProtocolPlayer protocol={activeProtocol} onClose={() => setView('dashboard')} />}
      {view === 'admin' && <AdminView protocols={protocols} onSave={setProtocols} onBack={() => setView('dashboard')} />}

      {showPremiumModal && (
        <PremiumModal 
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </Layout>
  );
}
