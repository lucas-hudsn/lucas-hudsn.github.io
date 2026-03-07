import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, type ComponentType } from 'react'
import { mdxComponents } from '../lib/mdx-components'

const projectMdx = import.meta.glob('../content/projects/*/index.mdx')
const blogMdx = import.meta.glob('../content/blog/*/index.mdx')

interface PostPageProps {
  type: 'projects' | 'blog'
}

export default function PostPage({ type }: PostPageProps) {
  const { slug } = useParams<{ slug: string }>()
  const [Content, setContent] = useState<ComponentType<{ components: Record<string, ComponentType> }> | null>(null)
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({})
  const [error, setError] = useState(false)

  useEffect(() => {
    const modules = type === 'projects' ? projectMdx : blogMdx
    const key = Object.keys(modules).find(k => k.includes(`/${slug}/`))
    if (!key) {
      setError(true)
      return
    }
    modules[key]().then((mod: unknown) => {
      const m = mod as { default: ComponentType<{ components: Record<string, ComponentType> }>; frontmatter: Record<string, unknown> }
      setContent(() => m.default)
      setFrontmatter(m.frontmatter || {})
    }).catch(() => setError(true))
  }, [slug, type])

  if (error) {
    return (
      <div>
        <h1>post not found</h1>
        <p><Link to={`/${type}`}>back to {type}</Link></p>
      </div>
    )
  }

  if (!Content) return <p style={{ color: 'var(--base1)' }}>loading...</p>

  const backPath = type === 'projects' ? '/projects' : '/blog'

  return (
    <article>
      <Link to={backPath} style={{ fontSize: '0.85rem', color: 'var(--base1)' }}>&larr; back to {type}</Link>
      <h1 style={{ marginTop: '0.75rem' }}>{(frontmatter.title as string) || slug}</h1>
      <div style={{ fontSize: '0.8rem', color: 'var(--base1)', marginBottom: '1.5rem' }}>
        {frontmatter.author as string} &middot; {frontmatter.date as string}
        {(frontmatter.categories as string[])?.map(c => (
          <span key={c} style={{ marginLeft: '0.5rem', background: 'var(--bg-secondary)', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>{c}</span>
        ))}
      </div>
      <Content components={mdxComponents as Record<string, ComponentType>} />
    </article>
  )
}
