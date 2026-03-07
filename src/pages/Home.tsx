import { Link } from 'react-router-dom'
import { allPosts } from '../lib/posts'
import PostCard from '../components/PostCard'

export default function Home() {
  const recent = allPosts.slice(0, 4)

  return (
    <div>
      <section style={{ marginBottom: '2.5rem' }}>
        <h1>lucas hudson</h1>
        <p style={{ fontSize: '1rem', color: 'var(--base01)', lineHeight: 1.6 }}>
          data scientist &amp; full stack ai engineer.
          building things with python, fastapi, and open-source models.
        </p>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          <Link to="/projects">projects</Link>
          <Link to="/blog">blog</Link>
          <Link to="/reading-watching">reading/watching</Link>
        </div>
      </section>

      <section>
        <h2>recent</h2>
        <div style={styles.grid}>
          {recent.map(p => <PostCard key={p.slug} post={p} />)}
        </div>
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
    gap: '1rem',
    marginTop: '0.75rem',
  },
}
