
import React from 'react';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-xs p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl">✨</span>
          </div>
          <h3 className="serif text-3xl text-stone-800 mb-2">Acesso Vital</h3>
          <p className="text-stone-500 font-light text-sm">
            Como usuário gratuito, você pode realizar um check-in diário e acessar o protocolo de Segurança Interna.
          </p>
        </div>

        <ul className="space-y-3 mb-8">
          <li className="flex items-center text-sm text-stone-600">
            <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Todos os 5 protocolos iniciais
          </li>
          <li className="flex items-center text-sm text-stone-600">
            <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Sugestões inteligentes de IA
          </li>
          <li className="flex items-center text-sm text-stone-600">
            <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Histórico de estados completo
          </li>
        </ul>

        <button 
          onClick={onUpgrade}
          className="w-full py-4 rounded-full bg-stone-800 text-white font-medium mb-3 shadow-lg active:scale-95 transition-transform"
        >
          Seja Premium
        </button>
        <button 
          onClick={onClose}
          className="w-full py-2 text-stone-400 text-xs font-medium hover:text-stone-600 transition-colors"
        >
          Talvez mais tarde
        </button>
      </div>
    </div>
  );
};
