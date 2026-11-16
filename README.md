# Kihabbo – layout (React + Vite + TS)

Layout responsivo da home do Kihabbo. Os boxes são só a **moldura**: o backend encaixa os componentes do painel como `children`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

O mockup original está em `public/assets/_mockup-referencia.png`.

## Estrutura

| Arquivo | O que é |
|---|---|
| `src/components/Box/Box.tsx` | moldura genérica de todos os boxes |
| `src/layout/Header/` | logo, fichas, nuvens animadas (`CloudLayer`), menu isométrico (`MenuBar`), avatar + botões do usuário (`UserHub`) |
| `src/layout/Header/menu.ts` | itens do menu, links do usuário e helper `habboAvatar(nick)` |
| `src/layout/RadioPanel/` | barra da rádio (play/pause/volume reais se passar `streamUrl`) + slots banner / TOP Eventos / Habbo Stars |
| `src/pages/Home.tsx` | grade com os boxes |
| `src/styles/tokens.css` | cores, raios, sombras, fonte |

## Usando o `<Box>`

```tsx
<Box
  title="Eventos"
  accent="green"                       // green | pink | orange | teal
  variant="light"                      // light | dark (coluna lateral) | bare
  primaryAction={{ label: 'Notificar evento', onClick: abrirModal }}
  search={{ placeholder: 'Pesquisar...', onSubmit: buscar }}
  onRefresh={recarregar}
  onPrev={anterior} onNext={proximo} prevDisabled={pagina === 0}
  sideStrip={{ color: 'pink', icon: <img src="..." /> }}   // faixa lateral (opcional)
  footer={<a href="/atacadao">Ver todos</a>}              // rodapé (opcional)
>
  <EventosDoPainel />
</Box>
```

Sem `children` o box mostra um slot tracejado “Slot do painel”. Use `hideRefresh` e `hideNav` para esconder botões.

`RadioPanel` aceita `banner`, `topEventos` e `habboStars` como ReactNode.

## Fidelidade ao layout
Medidas e cores foram tiradas pixel a pixel de `public/assets/_mockup-referencia.png` (1920px, container 1200px). Os valores ficam em `src/styles/tokens.css`.

Assets recortados do layout (fundo transparente):
- `footer-mascote.png`, `fansite.png` e `credit-*.png`: rodapé (o fundo é `footer-bg.png`, o mesmo Group 305 do kihabbo-new)
- `key.png`: chave das fichas
- `radio-arrow.png`: ícone do fim da barra da rádio
- `strip-emblemas.png` e `strip-imager.png`: ícones das faixas laterais

Os pisos isométricos (menu, plataforma do avatar, locutor) são SVG (`src/components/IsoTile`) com a geometria e as cores do layout.
Os ícones do menu são exibidos no tamanho natural; pixel art redimensionada fica quebrada.

## Responsividade
- **≥1232**: idêntico ao layout.
- **≤1024**: uma coluna, e a lateral vira uma grade de 2 colunas.
- **≤900**: o hub do usuário fica acima dos tiles do menu, e a barra da rádio quebra em 2 linhas.
- **≤640**: tudo empilhado.

As nuvens respeitam `prefers-reduced-motion`.
