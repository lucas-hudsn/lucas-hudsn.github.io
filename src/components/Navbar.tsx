import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const links = [
  { to: '/', label: 'home' },
  { to: '/projects', label: 'projects' },
  { to: '/blog', label: 'blog' },
  { to: '/reading-watching', label: 'reading/watching' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <NavLink to="/" style={styles.brand}>lucas-hudsn</NavLink>
        <button
          style={styles.toggle}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '×' : '≡'}
        </button>
        <div style={{ ...styles.links, ...(open ? styles.linksOpen : {}) }}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                ...styles.link,
                color: isActive ? 'var(--accent)' : 'var(--text)',
              })}
            >
              {l.label}
            </NavLink>
          ))}
          <a href="https://github.com/lucas-hudsn" style={styles.link} target="_blank" rel="noopener noreferrer">
            github
          </a>
        </div>
      </div>
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    borderBottom: '1px solid var(--border-light)',
    background: 'var(--bg)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  inner: {
    maxWidth: '48rem',
    margin: '0 auto',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  brand: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: 'var(--text-heading)',
    textDecoration: 'none',
  },
  toggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: 'var(--text)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  links: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
  },
  linksOpen: {},
  link: {
    fontSize: '0.875rem',
    textDecoration: 'none',
    color: 'var(--text)',
    transition: 'color 0.15s',
  },
}

// Media query handled via CSS — add responsive styles
const mobileCSS = `
@media (max-width: 640px) {
  nav button[aria-label="Toggle menu"] {
    display: block !important;
  }
  nav > div > div:last-child {
    display: none;
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.75rem;
  }
  nav > div > div:last-child[style*="flex-direction"] {
    display: flex;
  }
}
`
if (typeof document !== 'undefined' && !document.getElementById('navbar-mobile')) {
  const s = document.createElement('style')
  s.id = 'navbar-mobile'
  s.textContent = mobileCSS
  document.head.appendChild(s)
}
