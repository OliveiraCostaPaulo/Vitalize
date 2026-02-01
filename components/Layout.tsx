
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onLogoClick?: () => void;
  user?: any;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogoClick, user, onLogout }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleTitleClick = () => {
    if (!onLogoClick) return;
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      onLogoClick();
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 3000);
  };

  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col px-6 py-8 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-40 -z-10"></div>
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-stone-200 rounded-full blur-3xl opacity-30 -z-10"></div>
      
      <header className="mb-12 flex justify-between items-center">
        <h1 
          onClick={handleTitleClick}
          className="serif text-3xl font-light tracking-tight cursor-default select-none active:opacity-70 transition-opacity"
        >
          Vitalize
        </h1>
        
        {user ? (
          <button 
            onClick={onLogout}
            className="text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-800 transition-colors"
          >
            Sair
          </button>
        ) : (
          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
            <span className="text-xs font-medium text-stone-500">V</span>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="mt-auto py-6 text-center text-xs text-stone-400 font-light">
        "Você não precisa se consertar."
      </footer>
    </div>
  );
};
