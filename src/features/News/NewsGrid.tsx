import { Link } from 'react-router-dom'
import { longDate, type Post } from '../../services/kihabbo'
import styles from './News.module.css'

export function NewsCard({ post }: { post: Post }) {
  return (
    <Link to={`/noticias/${post.slug}`} className={styles.newsCard}>
      <span className={styles.newsCover}>
        {post.coverImage ? <img src={post.coverImage} alt="" loading="lazy" /> : <span className={styles.newsNoCover} />}
        <span className={styles.tag}>#{post.tags[0] ?? 'Kihabbo'}</span>
      </span>
      <span className={styles.newsBody}>
        <strong>{post.title}</strong>
        <span className={styles.excerpt}>{post.excerpt}</span>
        <span className={styles.newsMeta}>
          {post.author} · {longDate(post.publishedAt ?? post.createdAt)}
          <span>
            ♥ {post.likesCount} · {post.commentsCount} {post.commentsCount === 1 ? 'comentário' : 'comentários'}
          </span>
        </span>
      </span>
    </Link>
  )
}

/** Grade de cards; sem `posts` mostra o carregamento (esqueleto) */
export function NewsGrid({ posts, skeletons = 6, busy }: { posts?: Post[]; skeletons?: number; busy?: boolean }) {
  return (
    <ul className={`${styles.newsGrid} ${busy ? styles.busy : ''}`} aria-busy={!posts || busy}>
      {posts
        ? posts.map((post) => (
            <li key={post.id}>
              <NewsCard post={post} />
            </li>
          ))
        : Array.from({ length: skeletons }, (_, i) => <li key={i} className={`${styles.newsCard} ${styles.skeleton}`} />)}
    </ul>
  )
}
