import { useMemo, useState } from 'react'
import { Box } from '../../components/Box/Box'
import { useAsync } from '../../hooks/useAsync'
import { avatarUrl, getUser, loadFigureData, NotFoundError, type FigureData } from '../../services/habbo'
import {
  DEFAULT_FIGURE,
  parseFigure,
  REQUIRED,
  serializeFigure,
  TABS,
  tabOfType,
  thumbArea,
  thumbUrl,
  TYPE_LABEL,
  type Figure,
  type TabId,
} from './figure'
import styles from './HabboImagerBox.module.css'

type Gender = 'M' | 'F'
type GenderFilter = Gender | 'all'

/** edições do usuário em cima do visual carregado (nick) */
interface Edits {
  nick: string
  figure: string
  gender: Gender
}

const genderOf = (figure: Figure, data?: FigureData): Gender => {
  const hd = figure.hd && data?.sets.hd?.items.find(([id]) => id === figure.hd.id)
  return hd && hd[1] === 'F' ? 'F' : 'M'
}

export function HabboImagerBox({ initialNick }: { initialNick: string }) {
  const [nick, setNick] = useState(initialNick)
  const [edits, setEdits] = useState<Edits | null>(null)
  const [tab, setTab] = useState<TabId>('corpo')
  const [typeByTab, setTypeByTab] = useState<Record<TabId, string>>({ corpo: 'hd', cabeca: 'hr', cima: 'ch', baixo: 'lg' })
  // filtro das peças: null = gênero do avatar
  const [filterChoice, setFilterChoice] = useState<GenderFilter | null>(null)
  const [colorSlot, setColorSlot] = useState(0)
  const [direction, setDirection] = useState(4)
  const [headDirection, setHeadDirection] = useState(4)
  const [rotateHead, setRotateHead] = useState(false)
  const [rotateBody, setRotateBody] = useState(true)
  const [large, setLarge] = useState(true)

  const catalog = useAsync('figuredata', () => loadFigureData())
  const looked = useAsync(nick ? `look-${nick.toLowerCase()}` : null, (signal) => getUser(nick, signal))
  const data = catalog.data

  // visual atual = edição do usuário OU visual do nick buscado OU padrão
  const baseFigure = looked.data?.figureString ?? (looked.error ? DEFAULT_FIGURE : null)
  const figureString = edits?.nick === nick ? edits.figure : (baseFigure ?? DEFAULT_FIGURE)
  const figure = useMemo(() => parseFigure(figureString), [figureString])
  const gender: Gender = edits?.nick === nick ? edits.gender : genderOf(figure, data)
  const filter: GenderFilter = filterChoice ?? gender

  const type = typeByTab[tab]
  const worn = figure[type]
  const set = data?.sets[type]
  const palette = set ? data.palettes[set.palette] ?? [] : []
  const items = useMemo(
    () => (set?.items ?? []).filter(([, g]) => filter === 'all' || g === 'U' || g === filter),
    [set, filter],
  )
  const wornInfo = worn && set?.items.find(([id]) => id === worn.id)
  const colorCount = wornInfo ? wornInfo[3] : 0

  /* ---------- edição ---------- */
  const update = (next: Figure, nextGender = gender) =>
    setEdits({ nick, figure: serializeFigure(next), gender: nextGender })

  const defaultColor = () => palette.find(([, , club]) => club === 0)?.[0] ?? palette[0]?.[0] ?? 1

  const pickItem = (id: number | null) => {
    const next = { ...figure }
    if (id === null) {
      delete next[type]
    } else {
      const info = set?.items.find(([itemId]) => itemId === id)
      const needed = info ? info[3] : 1
      const current = figure[type]?.colors ?? []
      const colors = Array.from({ length: needed }, (_, i) => current[i] ?? current[0] ?? defaultColor())
      next[type] = { id, colors }
    }
    setColorSlot(0)
    update(next)
  }

  const pickColor = (colorId: number) => {
    if (!worn) return
    const colors = [...worn.colors]
    colors[colorSlot] = colorId
    update({ ...figure, [type]: { ...worn, colors } })
  }

  const pickGender = (g: GenderFilter) => {
    setFilterChoice(g === 'all' ? 'all' : null)
    if (g !== 'all' && g !== gender) update(figure, g)
  }

  // "Corpo": gira o corpo (a cabeça acompanha). "Cabeça": gira só a cabeça.
  const rotate = (step: number) => {
    const turn = (d: number) => (d + step + 8) % 8
    if (rotateBody) setDirection(turn)
    if (rotateBody || rotateHead) setHeadDirection(turn)
  }

  const goTab = (step: number) => {
    const i = TABS.findIndex((t) => t.id === tab)
    setTab(TABS[(i + step + TABS.length) % TABS.length].id)
  }

  const reset = () => {
    setEdits(null)
    looked.reload()
  }

  const wornList = Object.entries(figure).filter(([t]) => t !== 'hd' && TYPE_LABEL[t])

  return (
    <Box
      id="habbo-imager"
      title="Habbo imager"
      accent="teal"
      sideStrip={{ color: 'teal', icon: <img src="/assets/strip-imager.png" alt="" width={32} height={39} /> }}
      search={{
        placeholder: 'Pesquisar habbo...',
        onSubmit: (value) => {
          if (value.trim()) {
            setNick(value.trim())
            setEdits(null)
          }
        },
      }}
      onRefresh={reset}
      onPrev={() => goTab(-1)}
      onNext={() => goTab(1)}
      prevDisabled={false}
      nextDisabled={false}
      minBodyHeight={515}
    >
      <div className={styles.imager}>
        {/* ================= editor ================= */}
        <div className={styles.editor}>
          <div className={styles.tabs} role="tablist" aria-label="Partes do visual">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`${styles.tab} ${tab === t.id ? styles.active : ''}`}
                onClick={() => {
                  setTab(t.id)
                  setColorSlot(0)
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.subrow}>
            {tab === 'corpo'
              ? (
                  [
                    ['M', 'gender-m', 'Masculino'],
                    ['F', 'gender-f', 'Feminino'],
                    ['all', 'gender-u', 'Todas as peças'],
                  ] as const
                ).map(([g, icon, label]) => (
                  <button
                    key={g}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={filter === g}
                    className={`${styles.sub} ${styles.square} ${filter === g ? styles.subActive : ''}`}
                    onClick={() => pickGender(g)}
                  >
                    <img src={`/assets/ui/${icon}.png`} alt="" className="pixel" />
                  </button>
                ))
              : TABS.find((t) => t.id === tab)!.types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={type === t}
                    className={`${styles.sub} ${type === t ? styles.subActive : ''}`}
                    onClick={() => {
                      setTypeByTab((m) => ({ ...m, [tab]: t }))
                      setColorSlot(0)
                    }}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
          </div>

          <div className={`${styles.parts} ${styles.scroll}`} role="listbox" aria-label={TYPE_LABEL[type]}>
            {catalog.error ? (
              <p className={styles.note}>Catálogo de roupas indisponível. Rode “npm run sync:habbo”.</p>
            ) : !data ? (
              Array.from({ length: 24 }, (_, i) => <span key={i} className={`${styles.cell} ${styles.skeleton}`} />)
            ) : (
              <>
                {!REQUIRED.has(type) && (
                  <button
                    type="button"
                    role="option"
                    aria-selected={!worn}
                    title="Nenhum"
                    className={`${styles.cell} ${!worn ? styles.selected : ''}`}
                    onClick={() => pickItem(null)}
                  >
                    <span className={styles.none} aria-hidden="true" />
                  </button>
                )}
                {items.map(([id, , club, colors]) => (
                  <button
                    key={id}
                    type="button"
                    role="option"
                    aria-selected={worn?.id === id}
                    title={data.names[id] ?? `${TYPE_LABEL[type]} #${id}`}
                    className={`${styles.cell} ${styles[thumbArea(type)]} ${worn?.id === id ? styles.selected : ''}`}
                    onClick={() => pickItem(id)}
                  >
                    <img
                      src={thumbUrl(
                        type,
                        id,
                        Array.from({ length: colors }, (_, i) => worn?.colors[i] ?? worn?.colors[0] ?? defaultColor()),
                        figure.hd,
                        gender,
                      )}
                      alt=""
                      loading="lazy"
                      className="pixel"
                    />
                    {club > 0 && <span className={styles.hc}>HC</span>}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className={styles.colors}>
            {colorCount > 1 && (
              <div className={styles.slots}>
                {Array.from({ length: colorCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.slot} ${colorSlot === i ? styles.slotActive : ''}`}
                    onClick={() => setColorSlot(i)}
                  >
                    Cor {i + 1}
                  </button>
                ))}
              </div>
            )}
            {worn && colorCount > 0 ? (
              <div className={`${styles.swatches} ${styles.scroll}`} role="listbox" aria-label="Cores">
                {palette.map(([colorId, hex, club]) => (
                  <button
                    key={colorId}
                    type="button"
                    role="option"
                    aria-selected={worn.colors[colorSlot] === colorId}
                    title={club ? `#${hex} (HC)` : `#${hex}`}
                    className={`${styles.swatch} ${worn.colors[colorSlot] === colorId ? styles.swatchActive : ''}`}
                    style={{ background: `#${hex}` }}
                    onClick={() => pickColor(colorId)}
                  >
                    {club > 0 && <span className={styles.hcDot} />}
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.note}>{worn ? 'Esta peça não tem cores.' : 'Escolha uma peça para ver as cores.'}</p>
            )}
          </div>
        </div>

        {/* ================= prévia ================= */}
        <div className={styles.preview}>
          <div className={`${styles.stage} ${large ? styles.stageLarge : ''}`}>
            <span className={styles.floor} aria-hidden="true" />
            <img
              key={figureString}
              src={avatarUrl({
                figure: figureString,
                gender,
                direction,
                headDirection,
                size: large ? 'l' : 'm',
              })}
              alt={looked.error instanceof NotFoundError ? 'Visual padrão' : `Visual de ${nick}`}
              className={`${styles.avatar} pixel`}
            />
          </div>

          <div className={styles.arrows}>
            <button type="button" onClick={() => rotate(1)} aria-label="Girar para a esquerda">
              <img src="/assets/ui/rotate-left.png" alt="" className="pixel" />
            </button>
            <button type="button" onClick={() => rotate(-1)} aria-label="Girar para a direita">
              <img src="/assets/ui/rotate-right.png" alt="" className="pixel" />
            </button>
          </div>

          <fieldset className={styles.options}>
            <legend>Girar</legend>
            <Check label="Cabeça" checked={rotateHead} onChange={setRotateHead} />
            <Check label="Corpo" checked={rotateBody} onChange={setRotateBody} />
          </fieldset>
          <fieldset className={styles.options}>
            <legend>Tamanho</legend>
            <Check label="Padrão" checked={!large} onChange={() => setLarge(false)} />
            <Check label="Grande" checked={large} onChange={() => setLarge(true)} />
          </fieldset>

          {looked.error instanceof NotFoundError && <p className={styles.warn}>“{nick}” não encontrado.</p>}
        </div>

        {/* ================= peças vestidas ================= */}
        <div className={styles.worn}>
          <img
            src="/assets/ui/caixa-ajuda.png"
            alt=""
            className={`${styles.wornIcon} pixel`}
            title="Peças do visual: clique para editar"
          />
          <ul className={styles.scroll}>
            {wornList.map(([t, w]) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => {
                    const tabId = tabOfType(t)
                    setTab(tabId)
                    setTypeByTab((m) => ({ ...m, [tabId]: t }))
                    setColorSlot(0)
                  }}
                >
                  {data?.names[w.id] ?? `${TYPE_LABEL[t]} #${w.id}`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Box>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.box} aria-hidden="true" />
      {label}
    </label>
  )
}
