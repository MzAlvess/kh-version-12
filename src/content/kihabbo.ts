// Textos institucionais (mesmo conteúdo do kihabbo.com.br atual)

export interface TimelineEntry {
  year: string
  title?: string
  date?: string
  paragraphs: string[]
  quote?: string
  highlight?: { label: string; text: string }
}

export const historia = {
  intro: { period: '2010 — 2026', text: '16 anos construindo Um Mundo Diferente.' },
  timeline: [
    {
      year: '2010',
      title: 'Onde tudo começou',
      date: '27 de agosto de 2010',
      paragraphs: [
        'Foi nesse dia que um novo projeto de fã-site foi apresentado à comunidade do Habbo Hotel. O que começou como uma ideia entre amigos foi, aos poucos, ganhando forma, público e uma equipe dedicada a criar conteúdo, entretenimento e informação para os jogadores.',
        'A iniciativa partiu de Lek e DonoReal, fundadores da Kihabbo, que buscavam construir seu próprio espaço dentro da comunidade — reunindo pessoas interessadas em rádio, jornalismo, eventos, entretenimento e desenvolvimento.',
      ],
    },
    {
      year: '2012',
      title: 'Uma nova fase',
      paragraphs: [
        'Começaram os preparativos para uma nova etapa do projeto. Além dos veteranos Lek e DonoReal, nomes como Flawzy, .Asterisco e -BabyLeo- passaram a fazer parte dessa história, contribuindo para o que seria apresentado à comunidade no ano seguinte.',
      ],
    },
    {
      year: '2013',
      paragraphs: [
        'A Kihabbo retornou com uma nova proposta e novos objetivos, passando a concentrar seus esforços principalmente em entretenimento, comunicação e prestação de serviços para a comunidade Habbo. Cada nova versão era uma tentativa de evoluir o projeto e acompanhar as transformações do próprio Habbo e de sua comunidade.',
      ],
      highlight: {
        label: 'Uma história construída por pessoas',
        text: 'Diferentes gerações de administradores, desenvolvedores, locutores, jornalistas, moderadores, promotores e equipes de eventos ajudaram a manter o projeto vivo, muitos começaram sua experiência dentro da própria Kihabbo, outros retornaram anos depois trazendo novas ideias.',
      },
      quote: 'Mais do que suas diferentes versões, a Kihabbo sempre foi formada pelas pessoas que passaram por ela.',
    },
    {
      year: '2020',
      title: 'O retorno',
      paragraphs: [
        'Depois de diferentes períodos de atividade e pausa, a Kihabbo iniciou uma nova fase dez anos após sua criação. Com Lek, Flawzy e Rafaraujo96., o projeto retomou suas atividades e começou a reconstruir sua presença dentro da comunidade — abrindo caminho para um dos capítulos mais importantes de sua história.',
      ],
    },
    {
      year: '2021',
      title: 'Fã-site Oficial',
      paragraphs: [
        'Após mais de uma década desde o início do projeto, a Kihabbo passou a integrar o grupo de Fã-Sites Oficiais do Habbo BR/PT. A oficialização ampliou sua participação dentro da comunidade, promovendo campanhas, eventos e experiências desenvolvidas para os jogadores, de Aniversário da Kiki e Round Bobba a Kiki a Vapor, Eco dos Maias e Aventura entre Laços, entre muitas outras.',
      ],
    },
    {
      year: '2026',
      title: 'Uma nova Kihabbo',
      paragraphs: [
        'Dezesseis anos depois do início dessa história, a Kihabbo entra em uma nova fase. Em 2026, uma nova versão do site é lançada, trazendo uma renovação não apenas visual, mas também tecnológica, preparada para receber novos recursos, integrações e experiências.',
        'Esse novo capítulo também marca a chegada de uma nova diretoria, formada por membros do servidor Bobbagem, que assume a gestão da Kihabbo com o propósito de dar continuidade à sua história e, ao mesmo tempo, construir novos caminhos para o projeto.',
        'A nova Kihabbo preserva aquilo que sempre fez parte da sua identidade: comunidade, rádio, informação e entretenimento, agora unindo novas pessoas, ideias e tecnologias para escrever os próximos capítulos dessa história.',
      ],
      quote: 'Dezesseis anos depois, começa uma nova geração.',
    },
  ] satisfies TimelineEntry[],
  outro: {
    title: '16 anos de história.',
    lines: ['A tecnologia mudou.', 'O Habbo mudou.', 'A comunidade mudou.'],
    closing: 'A Kihabbo também. Mas a nossa história continua sendo escrita.',
  },
}

export const regras = [
  'Respeite todo mundo no chat da rádio e nos comentários.',
  'Nada de spam, flood ou divulgação não autorizada.',
  'Conteúdo sensível, ofensivo ou impróprio não é bem-vindo aqui.',
  'Denúncias falsas ou brincadeiras de mau gosto podem resultar em banimento.',
  'Dúvidas? Abra um contato pelo seu perfil que a equipe te ajuda.',
]

/** Áreas com vagas (notícia "Kihabbo contratando!") */
export const areasEquipe = [
  'Marketing',
  'Promotoria',
  'Conteúdo',
  'Locução',
  'Eventos',
  'Construção',
  'Programação Wired',
]

export const discord = {
  kihabbo: 'https://discord.gg/x5sekvpE5S',
  bobbagem: 'https://discord.gg/btSHexTVnH',
  bot: 'https://discord.com/oauth2/authorize?client_id=1552131795024089230',
  playerExterno: 'https://radio.kihabbo.com.br/',
}
