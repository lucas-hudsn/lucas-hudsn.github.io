import MediaLogEntry from '../components/MediaLogEntry'
import type { MediaEntry } from '../components/MediaLogEntry'
import mediaLog from '../content/media-log.json'

export default function ReadingWatching() {
  const entries = (mediaLog as MediaEntry[]).sort((a, b) => (b.date > a.date ? 1 : -1))

  return (
    <div>
      <h1>reading / watching</h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--base1)', marginBottom: '1rem' }}>
        things i'm consuming or have consumed recently.
      </p>
      <div>
        {entries.map((e, i) => <MediaLogEntry key={i} entry={e} />)}
      </div>
    </div>
  )
}
