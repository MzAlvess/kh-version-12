import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box } from '../components/Box/Box'
import { Field, FormRow, ImageUpload, Input, Select, Textarea } from '../components/Form/Form'
import { InlineForm } from '../components/Form/InlineForm'
import { Modal } from '../components/Modal/Modal'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { Tabs } from '../components/Tabs/Tabs'
import { HabboImagerBox } from '../features/HabboImager/HabboImagerBox'
import { DefaultSidebar } from '../features/Sidebar/Sidebar'
import { useAsync } from '../hooks/useAsync'
import { useModal } from '../modals/modalContext'
import { areasEquipe } from '../content/kihabbo'
import { formatDate, searchBadges, type NewBadge } from '../services/habbo'
import { swapToFallback } from '../components/BadgeImage/fallback'
import styles from './pages.module.css'

const TABS = [
  { id: 'equipe', label: 'Faça parte da equipe' },
  { id: 'contato', label: 'Contato' },
  { id: 'emblemas', label: 'Busca de emblemas' },
] as const
type TabId = (typeof TABS)[number]['id']

export function UtilidadesPage({ userNick }: { userNick: string }) {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.id === params.get('aba'))?.id ?? 'equipe') as TabId

  return (
    <PageGrid aside={<DefaultSidebar userNick={userNick} />}>
      <Box title="Utilidades" accent="orange" hideNav hideRefresh minBodyHeight={300}>
        <Tabs tabs={[...TABS]} active={tab} onChange={(id) => setParams({ aba: id }, { replace: true })} label="Ferramentas" />
        {tab === 'equipe' && <FacaParte nick={userNick} />}
        {tab === 'contato' && <Contato />}
        {tab === 'emblemas' && <BuscaEmblemas />}
      </Box>

      <HabboImagerBox initialNick={userNick} />
    </PageGrid>
  )
}

function FacaParte({ nick }: { nick: string }) {
  const { getHandler } = useModal()
  return (
    <>
      <p className={styles.lead}>
        Com o site renovado e muita vontade de movimentar a comunidade, estamos em busca de pessoas animadas,
        criativas e dispostas a aprender. <strong>Não precisa ter experiência!</strong> Um recrutador entrará em
        contato com você.
      </p>
      <ul className={styles.chips} aria-label="Áreas com vagas">
        {areasEquipe.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <InlineForm
        tone="green"
        submitLabel="Enviar candidatura"
        onSubmit={getHandler('faca-parte')}
        success={{ title: 'Candidatura enviada!', text: 'Um recrutador vai chamar você no Discord em breve.' }}
      >
        <FormRow>
          <Field label="Nick no Habbo" name="nick" required>
            <Input name="nick" required defaultValue={nick} maxLength={32} />
          </Field>
          <Field label="Usuário no Discord" name="discord" required>
            <Input name="discord" required maxLength={40} placeholder="ex.: kihabbo" autoComplete="off" />
          </Field>
        </FormRow>
        <Field label="Cargo almejado" name="cargo" required>
          <Select name="cargo" required defaultValue="">
            <option value="" disabled>
              Selecione...
            </option>
            {areasEquipe.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Por que você quer entrar?" name="motivo" hint="Opcional, mas ajuda o recrutador a te conhecer.">
          <Textarea name="motivo" rows={3} maxLength={500} />
        </Field>
      </InlineForm>
    </>
  )
}

function Contato() {
  const { getHandler } = useModal()
  return (
    <>
      <p className={styles.lead}>Dúvidas, sugestões ou problemas? Fale com a equipe. Respondemos pelo seu perfil.</p>
      <InlineForm
        tone="orange"
        submitLabel="Enviar mensagem"
        onSubmit={getHandler('contato')}
        success={{ title: 'Mensagem enviada!', text: 'Você recebe uma notificação quando a equipe responder.' }}
      >
        <FormRow>
          <Field label="Assunto" name="assunto" required>
            <Select name="assunto" required defaultValue="">
              <option value="" disabled>
                Selecione...
              </option>
              <option value="suporte">Suporte</option>
              <option value="denuncia">Denúncia</option>
              <option value="banimento">Contestar banimento</option>
              <option value="parceria">Parceria</option>
              <option value="sugestao">Sugestão</option>
            </Select>
          </Field>
          <Field label="Título" name="titulo" required>
            <Input name="titulo" required maxLength={80} />
          </Field>
        </FormRow>
        <Field label="Mensagem" name="mensagem" required>
          <Textarea name="mensagem" rows={5} required minLength={10} maxLength={1000} />
        </Field>
        <Field label="Anexo" name="anexo" hint="Opcional: um print ajuda a resolver mais rápido.">
          <ImageUpload name="anexo" aspect="16 / 4" />
        </Field>
      </InlineForm>
    </>
  )
}

const BADGES_PER_PAGE = 24

function BuscaEmblemas() {
  const [term, setTerm] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<NewBadge | null>(null)
  const { data, error, loading, previous } = useAsync(`badge-search-${submitted}-${page}`, (s) =>
    searchBadges({ term: submitted, limit: BADGES_PER_PAGE, offset: page * BADGES_PER_PAGE }, s),
  )
  const badges = data ?? (loading ? previous : undefined)

  return (
    <>
      <form
        className={styles.searchBar}
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(term.trim())
          setPage(0)
        }}
      >
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Código ou nome do emblema (ex.: PTF88, Natal)" />
        <button type="submit" className={styles.searchBtn}>
          Buscar
        </button>
      </form>

      {error ? (
        <p className={styles.state}>Não foi possível buscar agora. Tente de novo em instantes.</p>
      ) : !badges ? (
        <p className={styles.state}>Carregando...</p>
      ) : badges.length ? (
        <>
          <ul className={`${styles.badgeGrid} ${loading ? styles.busy : ''}`}>
            {badges.map((b) => (
              <li key={b.code}>
                <button type="button" onClick={() => setSelected(b)} title={b.name}>
                  <img src={b.imageUrl}
                onError={swapToFallback(b.fallbackUrl)} alt={b.name} loading="lazy" className="pixel" />
                  <span>{b.code}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.pagerRow}>
            <button type="button" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)}>
              ‹ Anteriores
            </button>
            <span>Página {page + 1}</span>
            <button
              type="button"
              disabled={loading || badges.length < BADGES_PER_PAGE}
              onClick={() => setPage((p) => p + 1)}
            >
              Próximos ›
            </button>
          </div>
        </>
      ) : (
        <p className={styles.state}>Nenhum emblema encontrado para “{submitted}”.</p>
      )}

      {selected && (
        <Modal title="Emblema" tone="orange" size="sm" onClose={() => setSelected(null)}>
          <div className={styles.badgeDetail}>
            <img src={selected.imageUrl}
                onError={swapToFallback(selected.fallbackUrl)} alt="" className="pixel" />
            <strong>{selected.name || selected.code}</strong>
            {selected.description && <p>{selected.description}</p>}
            <small>
              {selected.code} · {formatDate(selected.createdAt)}
            </small>
          </div>
        </Modal>
      )}
    </>
  )
}
