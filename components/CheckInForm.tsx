
import React, { useState } from 'react';
import { BodyState, EmotionState, EnergyState, UserCheckIn } from '../types';

interface CheckInFormProps {
  onComplete: (data: UserCheckIn) => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [body, setBody] = useState<BodyState>('Neutro');
  const [emotion, setEmotion] = useState<EmotionState>('Calma');
  const [energy, setEnergy] = useState<EnergyState>('Média');

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete({
        body,
        emotion,
        energy,
        timestamp: Date.now()
      });
    }
  };

  const Option: React.FC<{ 
    label: string, 
    selected: boolean, 
    onClick: () => void 
  }> = ({ label, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full py-4 px-6 rounded-2xl mb-3 text-left transition-all duration-300 ${
        selected 
          ? 'bg-stone-800 text-stone-50 scale-[1.02] shadow-lg' 
          : 'bg-white/80 hover:bg-white text-stone-700'
      }`}
    >
      <span className="text-lg font-light">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">Passo {step + 1} de 3</span>
        <h2 className="serif text-4xl mt-2 leading-tight">
          {step === 0 && "Como está seu corpo agora?"}
          {step === 1 && "Qual emoção predomina?"}
          {step === 2 && "Como está sua energia vital?"}
        </h2>
      </div>

      <div className="flex-1">
        {step === 0 && (
          <>
            <Option label="Tenso" selected={body === 'Tenso'} onClick={() => setBody('Tenso')} />
            <Option label="Neutro" selected={body === 'Neutro'} onClick={() => setBody('Neutro')} />
            <Option label="Aberto" selected={body === 'Aberto'} onClick={() => setBody('Aberto')} />
          </>
        )}
        {step === 1 && (
          <>
            <Option label="Medo" selected={emotion === 'Medo'} onClick={() => setEmotion('Medo')} />
            <Option label="Ansiedade" selected={emotion === 'Ansiedade'} onClick={() => setEmotion('Ansiedade')} />
            <Option label="Apatia" selected={emotion === 'Apatia'} onClick={() => setEmotion('Apatia')} />
            <Option label="Calma" selected={emotion === 'Calma'} onClick={() => setEmotion('Calma')} />
            <Option label="Presença" selected={emotion === 'Presença'} onClick={() => setEmotion('Presença')} />
          </>
        )}
        {step === 2 && (
          <>
            <Option label="Baixa" selected={energy === 'Baixa'} onClick={() => setEnergy('Baixa')} />
            <Option label="Média" selected={energy === 'Média'} onClick={() => setEnergy('Média')} />
            <Option label="Alta" selected={energy === 'Alta'} onClick={() => setEnergy('Alta')} />
          </>
        )}
      </div>

      <button
        onClick={handleNext}
        className="w-full py-5 rounded-full btn-vitalize text-lg font-medium shadow-xl mt-6 active:scale-95"
      >
        {step === 2 ? "Finalizar" : "Continuar"}
      </button>
    </div>
  );
};
