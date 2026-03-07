export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <span>lucas hudson &middot; 2026</span>
        <span style={styles.links}>
          <a href="https://github.com/lucas-hudsn" target="_blank" rel="noopener noreferrer">github</a>
          {' · '}
          <a href="https://www.linkedin.com/in/lucas-hudson-0a1384183/" target="_blank" rel="noopener noreferrer">linkedin</a>
        </span>
      </div>
    </footer>
  )
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    borderTop: '1px solid var(--border-light)',
    marginTop: 'auto',
    padding: '1.5rem',
    fontSize: '0.8rem',
    color: 'var(--base1)',
  },
  inner: {
    maxWidth: '48rem',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  links: {},
}
