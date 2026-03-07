import { projects } from '../lib/posts'
import PostCard from '../components/PostCard'

export default function Projects() {
  return (
    <div>
      <h1>projects</h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--base1)', marginBottom: '1.5rem' }}>
        full stack apps, ai tools, and experiments.
      </p>
      <div style={styles.grid}>
        {projects.map(p => <PostCard key={p.slug} post={p} />)}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
    gap: '1rem',
  },
}
