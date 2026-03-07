import { useState, type ReactNode, type HTMLAttributes } from 'react'

export default function CodeBlock({ children, ...props }: HTMLAttributes<HTMLPreElement> & { children?: ReactNode }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const el = document.querySelector('[data-copy-target]')
    if (!el) return
    navigator.clipboard.writeText(el.textContent || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'var(--bg)',
          border: '1px solid var(--border-light)',
          borderRadius: '2px',
          padding: '0.2rem 0.5rem',
          fontSize: '0.7rem',
          fontFamily: 'inherit',
          color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        {copied ? 'copied' : 'copy'}
      </button>
      <pre {...props} data-copy-target="">
        {children}
      </pre>
    </div>
  )
}
