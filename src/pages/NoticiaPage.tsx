import { Link, useParams } from 'react-router-dom'
import { Box } from '../components/Box/Box'
import { Notice } from '../components/Form/Form'
import { Markdown } from '../components/Markdown/Markdown'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { DefaultSidebar } from '../features/Sidebar/Sidebar'
import { useAsync } from '../hooks/useAsync'
import { avatarUrl, timeAgo } from '../services/habbo'
import { ApiError, getComments, getPost, longDate, readingTime, type Comment } from '../services/kihabbo'
import styles from './pages.module.css'

export function NoticiaPage({ userNick }: { userNick: string }) {
  const { slug = '' } = useParams()
  const post = useAsync(`post-${slug}`, (s) => getPost(slug, s))
  const comments = useAsync(post.data ? `comments-${post.data.id}` : null, (s) => getComments(post.data!.id, s))

  const notFound = post.error instanceof ApiError && post.error.status === 404

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
              <span>♥ {post.data.likesCount}</span>
            </p>
            {post.data.coverImage && <img src={post.data.coverImage} alt="" className={styles.articleCover} />}
            <Markdown source={post.data.content} />
          </article>
        )}
      </Box>

      {post.data && (
        <Box
          title={`Comentários (${comments.data?.length ?? post.data.commentsCount})`}
          accent="green"
          hideNav
          onRefresh={comments.reload}
          minBodyHeight={80}
        >
          {comments.error ? (
            <p className={styles.state}>Não foi possível carregar os comentários.</p>
          ) : !comments.data ? (
            <p className={styles.state}>Carregando...</p>
          ) : (
            <>
              <CommentList comments={comments.data} />
              <div className={styles.commentNotice}>
                <Notice>Entre com sua conta Habbo para comentar e curtir.</Notice>
              </div>
            </>
          )}
        </Box>
      )}
    </PageGrid>
  )
}

function CommentList({ comments }: { comments: Comment[] }) {
  if (!comments.length) return <p className={styles.state}>Seja o primeiro a comentar.</p>
  const roots = comments.filter((c) => !c.parentId)
  const replies = (id: string) => comments.filter((c) => c.parentId === id)

  const render = (c: Comment) => (
    <li key={c.id}>
      <div className={styles.comment}>
        <span className={styles.commentHead}>
          <img src={avatarUrl({ user: c.author, headonly: true, size: 'm', direction: 3 })} alt="" loading="lazy" className="pixel" />
        </span>
        <div>
          <p className={styles.commentMeta}>
            <strong>{c.author}</strong> · {timeAgo(c.createdAt)}
            {c.likesCount > 0 && <span> · ♥ {c.likesCount}</span>}
          </p>
          <p className={c.deleted ? styles.commentDeleted : undefined}>
            {c.deleted ? 'Comentário removido pela moderação.' : c.text}
          </p>
        </div>
      </div>
      {replies(c.id).length > 0 && <ul className={styles.replies}>{replies(c.id).map(render)}</ul>}
    </li>
  )

  return <ul className={styles.comments}>{roots.map(render)}</ul>
}
