export interface MediaEntry {
  title: string
  creator: string
  type: 'book' | 'video' | 'podcast' | 'article' | 'course'
  status: 'reading' | 'watching' | 'finished' | 'dropped'
  date: string
  note?: string
  url?: string
}

const typeIcons: Record<string, string> = {
  book: '[book]',
  video: '[video]',
  podcast: '[pod]',
  article: '[article]',
  course: '[course]',
}

const statusColors: Record<string, string> = {
  reading: 'var(--yellow)',
  watching: 'var(--yellow)',
  finished: 'var(--green)',
  dropped: 'var(--red)',
}

export default function MediaLogEntry({ entry }: { entry: MediaEntry }) {
  return (
    <div style={styles.entry}>
      <div style={styles.header}>
        <span style={{ color: 'var(--base1)', fontSize: '0.8rem' }}>
          {typeIcons[entry.type] || `[${entry.type}]`}
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
          {entry.url ? <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.title}</a> : entry.title}
        </span>
        <span style={{ color: statusColors[entry.status] || 'var(--text)', fontSize: '0.8rem' }}>
          {entry.status}
        </span>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--base1)' }}>
        {entry.creator} &middot; {entry.date}
      </div>
      {entry.note && <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{entry.note}</p>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  entry: {
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--border-light)',
  },
  header: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
}
