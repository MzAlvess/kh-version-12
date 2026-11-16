import { habboAvatar } from '../layout/Header/menu'
import type { Poll } from './types'

// Dados de exemplo — o backend substitui pelas enquetes reais.
const head = (nick: string) => `${habboAvatar(nick, 's')}&headonly=1`

export const samplePolls: Poll[] = [
  {
    id: 'habbo-stars',
    pergunta: 'Habbo Stars: melhor locutor',
    descricao: 'Votação semanal',
    opcoes: [
      { value: 'raraujo96', label: 'Raraujo96.', description: 'Show da Madrugada', image: head('Raraujo96.') },
      { value: 'dinholol', label: 'Dinho...lol', description: 'Show do Coelho', image: head('Dinho...lol') },
      { value: 'missfurby', label: 'MissFurby', description: 'Evento Reality', image: head('MissFurby') },
    ],
  },
  {
    id: 'evento-do-mes',
    pergunta: 'Qual foi o melhor evento do mês?',
    opcoes: [
      { value: 'habblindados', label: 'Habblindados: Evento mensal de abril/2025' },
      { value: 'arquitetos', label: 'Arquitetos em Ação: Do Luxo ao Lixo' },
      { value: 'miss-fashion', label: 'Grand Miss Fashion 2025: A final' },
    ],
  },
]
