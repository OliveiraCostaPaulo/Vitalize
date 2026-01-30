import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("Vitalize: Iniciando aplicação...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Vitalize: Elemento 'root' não encontrado no DOM.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Vitalize: Renderização React disparada com sucesso.");
  } catch (error) {
    console.error("Vitalize: Erro fatal durante a montagem do React:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Erro ao carregar app: ${error.message}</div>`;
  }
}