
import { Protocol } from './types';

export const ANCHOR_PHRASES = [
  "Você não está quebrado. Está defendido.",
  "O brilho volta quando o corpo confia.",
  "Você não precisa se consertar. Precisa se sentir seguro para existir.",
  "A presença é a ausência de defesa.",
  "Respire. Seu sistema nervoso está aprendendo a relaxar.",
  "A vitalidade não se cria, se permite.",
  "Menos esforço, mais abertura."
];

export const PROTOCOLS: Protocol[] = [
  {
    id: 'seguranca-interna',
    title: 'Segurança Interna',
    description: 'Um retorno à base quando o mundo parece barulhento.',
    duration: '5:40',
    premium: false,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'corpo-desarmado',
    title: 'Corpo Desarmado',
    description: 'Soltando as armaduras invisíveis que carregamos no dia a dia.',
    duration: '7:20',
    premium: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'retorno-ao-brilho',
    title: 'Retorno ao Brilho',
    description: 'Restaurando a vitalidade e a conexão com o prazer de existir.',
    duration: '6:15',
    premium: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'presenca-sem-motivo',
    title: 'Presença Sem Motivo',
    description: 'Estar aqui, simplesmente porque é possível.',
    duration: '8:00',
    premium: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'coragem-suave',
    title: 'Coragem Suave',
    description: 'Agir a partir de um estado de regulação e paz.',
    duration: '5:10',
    premium: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  }
];
