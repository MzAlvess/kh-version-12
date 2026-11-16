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

## Modais e formulários

Os botões abrem modais no mesmo padrão visual das caixas:

| Botão | Modal (`ModalName`) | Arquivo |
|---|---|---|
| Notificar evento | `notificar-evento` | `src/modals/forms/NotificarEvento.tsx` |
| Postar artigo | `postar-artigo` | `src/modals/forms/PostarArtigo.tsx` |
| Votar na enquete (Habbo Stars) | `votar-enquete` | `src/modals/forms/VotarEnquete.tsx` |
| Gerar fichas | `gerar-fichas` | `src/modals/forms/GerarFichas.tsx` |
| Abrir ticket | `abrir-ticket` | `src/modals/forms/AbrirTicket.tsx` |
| Sair | `sair` | `src/modals/forms/Sair.tsx` |
| Enquetes | `enquetes` | `src/modals/forms/Enquetes.tsx` |
| Config. | `config` | `src/modals/forms/Config.tsx` |
| Habbo | `habbo` | `src/modals/forms/Habbo.tsx` |

Gerar fichas, Enquetes, Config. e Habbo têm campos genéricos. Ajustem quando as regras estiverem definidas.

**Ligando ao backend:** em `src/App.tsx`, preencha `handlers`. Cada função recebe os valores do formulário (os arquivos vêm como `File`):

```ts
const handlers: ModalHandlers = {
  'postar-artigo': async (values) => {
    const body = new FormData()
    Object.entries(values).forEach(([k, v]) => body.append(k, v as string | Blob))
    const res = await fetch('/api/artigos', { method: 'POST', body })
    if (!res.ok) throw new Error('Não foi possível publicar o artigo.') // aparece no modal
  },
  sair: () => { window.location.href = '/logout' },
}
```

Enquanto um modal não tiver handler, o envio é simulado e os dados aparecem no console.
As enquetes vêm da prop `polls` do `ModalProvider` (exemplo em `src/modals/sampleData.ts`).

Para abrir um modal de qualquer componente: `const { openModal } = useModal(); openModal('abrir-ticket')`.

**Criar um novo modal:** crie o arquivo em `src/modals/forms/` usando `<FormModal>` e os campos de `src/components/Form` (`Field`, `Input`, `Select`, `Textarea`, `ImageUpload`, `Switch`, `ChoiceList`, `FormRow`, `Notice`). Depois registre o nome em `types.ts` e no `registry` do `ModalProvider.tsx`.
A validação usa os atributos nativos (`required`, `maxLength`, `pattern`, `min`...) e mostra as mensagens no padrão do site.

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
