
export type BodyState = 'Tenso' | 'Neutro' | 'Aberto';
export type EmotionState = 'Medo' | 'Ansiedade' | 'Apatia' | 'Calma' | 'Presença';
export type EnergyState = 'Baixa' | 'Média' | 'Alta';

export interface UserCheckIn {
  body: BodyState;
  emotion: EmotionState;
  energy: EnergyState;
  timestamp: number;
}

export interface Protocol {
  id: string;
  title: string;
  description: string;
  duration: string;
  premium: boolean;
  audioUrl: string; // Placeholder in MVP
}

export interface AppState {
  isLoggedIn: boolean;
  isPremium: boolean;
  lastCheckIn: UserCheckIn | null;
  dailyCheckInDone: boolean;
  checkInCount: number;
}
