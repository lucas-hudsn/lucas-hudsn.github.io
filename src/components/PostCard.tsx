import { Link } from 'react-router-dom'
import type { PostMeta } from '../lib/posts'

export default function PostCard({ post }: { post: PostMeta }) {
  const basePath = post.type === 'project' ? '/projects' : '/blog'

  return (
    <article style={styles.card}>
      {post.image && (
        <Link to={`${basePath}/${post.slug}`}>
          <img src={post.image} alt={post.title} style={styles.image} />
        </Link>
      )}
      <div style={styles.body}>
        <Link to={`${basePath}/${post.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={styles.title}>{post.title}</h3>
        </Link>
        <div style={styles.meta}>
          <time>{post.date}</time>
          {post.categories?.map(c => (
            <span key={c} style={styles.tag}>{c}</span>
          ))}
        </div>
        {post.description && <p style={styles.desc}>{post.description}</p>}
      </div>
    </article>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: '1px solid var(--border-light)',
    borderRadius: '2px',
    overflow: 'hidden',
    background: 'var(--bg)',
    transition: 'border-color 0.15s',
  },
  image: {
    width: '100%',
    height: '12rem',
    objectFit: 'cover',
    display: 'block',
    border: 'none',
    borderBottom: '1px solid var(--border-light)',
    borderRadius: 0,
  },
  body: {
    padding: '1rem',
  },
  title: {
    fontSize: '1.05rem',
    margin: 0,
    color: 'var(--text-heading)',
  },
  meta: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontSize: '0.8rem',
    color: 'var(--base1)',
    margin: '0.35rem 0 0.5rem',
  },
  tag: {
    background: 'var(--bg-secondary)',
    padding: '0.1rem 0.4rem',
    borderRadius: '2px',
    fontSize: '0.75rem',
  },
  desc: {
    fontSize: '0.875rem',
    margin: 0,
    color: 'var(--text)',
    lineHeight: 1.5,
  },
}
