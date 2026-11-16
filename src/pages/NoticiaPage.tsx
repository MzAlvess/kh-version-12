import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { Box } from '../components/Box/Box'
import { Button } from '../components/Button/Button'
import { Notice } from '../components/Form/Form'
import { Markdown } from '../components/Markdown/Markdown'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { DefaultSidebar } from '../features/Sidebar/Sidebar'
import { useAsync } from '../hooks/useAsync'
import { useModal } from '../modals/modalContext'
import { avatarUrl, timeAgo } from '../services/habbo'
import {
  ApiError,
  BANNED_MESSAGE,
  createComment,
  getComments,
  getPost,
  likeComment,
  likePost,
  longDate,
  readingTime,
  type Comment,
} from '../services/kihabbo'
import styles from './pages.module.css'

type LikeState = { liked: boolean; count: number }

export function NoticiaPage({ userNick }: { userNick: string }) {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const { openModal } = useModal()
  const post = useAsync(`post-${slug}`, (s) => getPost(slug, s))
  const comments = useAsync(post.data ? `comments-${post.data.id}` : null, (s) => getComments(post.data!.id, s))

  // alterações feitas nesta visita (comentários enviados e curtidas), por cima do que veio da API
  const [added, setAdded] = useState<Comment[]>([])
  const [postLike, setPostLike] = useState<LikeState | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const notFound = post.error instanceof ApiError && post.error.status === 404
  const allComments = [...(comments.data ?? []), ...added.filter((a) => !comments.data?.some((c) => c.id === a.id))]

  const like = postLike ?? (post.data ? { liked: !!post.data.liked, count: post.data.likesCount } : null)

  const togglePostLike = async () => {
    if (!post.data || !like) return
    if (!user) return openModal('entrar')
    if (user.banned) return setActionError(BANNED_MESSAGE)
    const next = !like.liked
    setPostLike({ liked: next, count: like.count + (next ? 1 : -1) }) // otimista
    try {
      const r = await likePost(post.data.id, next)
      if (typeof r?.likesCount === 'number') setPostLike({ liked: r.liked ?? next, count: r.likesCount })
    } catch (err) {
      const already = err instanceof ApiError && (err.code === 'ALREADY_LIKED' || (!next && err.status === 404))
      if (!already) {
        setPostLike(like)
        setActionError('Não foi possível registrar sua curtida.')
      }
    }
  }

  const send = async (text: string, parentId?: string) => {
    if (!post.data) return false
    setActionError(null)
    try {
      const c = await createComment(post.data.id, text, parentId)
      setAdded((list) => [...list, { ...c, parentId: c.parentId ?? parentId ?? null, author: c.author ?? user?.displayName ?? '' }])
      return true
    } catch (err) {
      setActionError(err instanceof Error && err.message ? err.message : 'Não foi possível enviar seu comentário agora.')
      return false
    }
  }

  return (
    <PageGrid aside={<DefaultSidebar userNick={userNick} />}>
      <Box title="Notícia" accent="green" hideNav onRefresh={post.reload} minBodyHeight={300}>
        <Link to="/noticias" className={styles.back}>
          ‹ Todas as notícias
        </Link>

        {post.error ? (
          <p className={styles.state}>
            {notFound ? 'Notícia não encontrada.' : 'Não foi possível carregar esta notícia.'}
          </p>
        ) : !post.data ? (
          <p className={styles.state}>Carregando...</p>
        ) : (
          <article className={styles.article}>
            <h1>{post.data.title}</h1>
            <p className={styles.articleMeta}>
              <span className={styles.byline}>
                {post.data.authorUsername && (
                  <img
                    src={avatarUrl({ user: post.data.authorUsername, headonly: true, size: 's', direction: 3 })}
                    alt=""
                    className="pixel"
                  />
                )}
                <strong>{post.data.author}</strong>
              </span>
              <span>{longDate(post.data.publishedAt ?? post.data.createdAt)}</span>
              <span>{readingTime(post.data.content)} min de leitura</span>
              {like && (
                <button
                  type="button"
                  className={`${styles.likeBtn} ${like.liked ? styles.liked : ''}`}
                  onClick={togglePostLike}
                  aria-pressed={like.liked}
                  title={user ? (like.liked ? 'Descurtir' : 'Curtir') : 'Entre para curtir'}
                >
                  ♥ {like.count}
                </button>
              )}
            </p>
            {post.data.coverImage && <img src={post.data.coverImage} alt="" className={styles.articleCover} />}
            <Markdown source={post.data.content} />
          </article>
        )}
      </Box>

      {post.data && (
        <Box
          title={`Comentários (${comments.data ? allComments.length : post.data.commentsCount})`}
          accent="green"
          hideNav
          onRefresh={() => {
            setAdded([])
            comments.reload()
          }}
          minBodyHeight={80}
        >
          {actionError && (
            <div className={styles.commentNotice}>
              <Notice tone="error">{actionError}</Notice>
            </div>
          )}

          {comments.error ? (
            <p className={styles.state}>Não foi possível carregar os comentários.</p>
          ) : !comments.data ? (
            <p className={styles.state}>Carregando...</p>
          ) : (
            <>
              <CommentList
                comments={allComments}
                canInteract={!!user && !user.banned}
                onNeedLogin={() => (user?.banned ? setActionError(BANNED_MESSAGE) : openModal('entrar'))}
                onReply={send}
              />
              <div className={styles.commentNotice}>
                {user?.banned ? (
                  <Notice tone="error">{BANNED_MESSAGE}</Notice>
                ) : user ? (
                  <CommentForm onSend={(t) => send(t)} placeholder="Escreva um comentário..." />
                ) : (
                  <div className={styles.loginRow}>
                    <Notice>Entre com sua conta Habbo para comentar e curtir.</Notice>
                    <Button tone="green" onClick={() => openModal('entrar')}>
                      Entrar
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Box>
      )}
    </PageGrid>
  )
}

function CommentForm({
  onSend,
  placeholder,
  onCancel,
}: {
  onSend: (text: string) => Promise<boolean>
  placeholder: string
  onCancel?: () => void
}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      className={styles.commentForm}
      onSubmit={async (e) => {
        e.preventDefault()
        if (!text.trim() || busy) return
        setBusy(true)
        if (await onSend(text)) setText('')
        setBusy(false)
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        maxLength={1000}
        rows={3}
        aria-label={placeholder}
      />
      <div className={styles.commentFormActions}>
        <small>{text.length}/1000</small>
        {onCancel && (
          <Button tone="ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
        )}
        <Button tone="green" type="submit" loading={busy} disabled={!text.trim()}>
          Enviar
        </Button>
      </div>
    </form>
  )
}

interface CommentListProps {
  comments: Comment[]
  canInteract: boolean
  onNeedLogin: () => void
  onReply: (text: string, parentId: string) => Promise<boolean>
}

function CommentList({ comments, canInteract, onNeedLogin, onReply }: CommentListProps) {
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [likes, setLikes] = useState<Record<string, LikeState>>({})

  if (!comments.length) return <p className={styles.state}>Seja o primeiro a comentar.</p>
  const roots = comments.filter((c) => !c.parentId)
  const replies = (id: string) => comments.filter((c) => c.parentId === id)

  const toggleLike = async (c: Comment) => {
    if (!canInteract) return onNeedLogin()
    const current = likes[c.id] ?? { liked: !!c.liked, count: c.likesCount }
    const next = !current.liked
    setLikes((m) => ({ ...m, [c.id]: { liked: next, count: current.count + (next ? 1 : -1) } }))
    try {
      const r = await likeComment(c.id, next)
      setLikes((m) => ({ ...m, [c.id]: { liked: r.liked, count: r.likesCount } }))
    } catch (err) {
      const already = err instanceof ApiError && (err.code === 'ALREADY_LIKED' || (!next && err.status === 404))
      if (!already) setLikes((m) => ({ ...m, [c.id]: current }))
    }
  }

  const render = (c: Comment, isReply = false) => {
    const like = likes[c.id] ?? { liked: !!c.liked, count: c.likesCount }
    return (
      <li key={c.id}>
        <div className={styles.comment}>
          <span className={styles.commentHead}>
            <img src={avatarUrl({ user: c.author, headonly: true, size: 'm', direction: 3 })} alt="" loading="lazy" className="pixel" />
          </span>
          <div className={styles.commentBody}>
            <p className={styles.commentMeta}>
              <strong>{c.author}</strong> · {timeAgo(c.createdAt)}
            </p>
            <p className={c.deleted ? styles.commentDeleted : undefined}>
              {c.deleted ? 'Comentário removido pela moderação.' : c.text}
            </p>
            {!c.deleted && (
              <div className={styles.commentActions}>
                <button
                  type="button"
                  className={like.liked ? styles.liked : undefined}
                  onClick={() => toggleLike(c)}
                  aria-pressed={like.liked}
                >
                  ♥ {like.count}
                </button>
                {!isReply && (
                  <button type="button" onClick={() => (canInteract ? setReplyTo(replyTo === c.id ? null : c.id) : onNeedLogin())}>
                    Responder
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {replyTo === c.id && (
          <div className={styles.replyForm}>
            <CommentForm
              placeholder={`Responder ${c.author}...`}
              onCancel={() => setReplyTo(null)}
              onSend={async (t) => {
                const ok = await onReply(t, c.id)
                if (ok) setReplyTo(null)
                return ok
              }}
            />
          </div>
        )}
        {replies(c.id).length > 0 && <ul className={styles.replies}>{replies(c.id).map((r) => render(r, true))}</ul>}
      </li>
    )
  }

  return <ul className={styles.comments}>{roots.map((c) => render(c))}</ul>
}
