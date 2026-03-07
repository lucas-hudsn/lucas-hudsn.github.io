export interface PostMeta {
  title: string
  author: string
  date: string
  description?: string
  categories?: string[]
  image?: string
  type: 'project' | 'blog'
  slug: string
}

interface MdxModule {
  frontmatter: {
    title?: string
    author?: string
    date?: string
    description?: string
    categories?: string[]
    image?: string
    type?: string
  }
}

const projectModules = import.meta.glob<MdxModule>('../content/projects/*/index.mdx', { eager: true })
const blogModules = import.meta.glob<MdxModule>('../content/blog/*/index.mdx', { eager: true })

function extractPosts(modules: Record<string, MdxModule>, type: 'project' | 'blog'): PostMeta[] {
  return Object.entries(modules).map(([path, mod]) => {
    const slug = path.split('/').slice(-2, -1)[0]
    const fm = mod.frontmatter || {}
    const imageBase = type === 'project' ? `/src/content/projects/${slug}/` : `/src/content/blog/${slug}/`
    return {
      title: fm.title || slug,
      author: fm.author || 'Lucas Hudson',
      date: fm.date || '',
      description: fm.description,
      categories: fm.categories,
      image: fm.image ? imageBase + fm.image : undefined,
      type,
      slug,
    }
  }).sort((a, b) => (b.date > a.date ? 1 : -1))
}

export const projects: PostMeta[] = extractPosts(projectModules, 'project')
export const blogPosts: PostMeta[] = extractPosts(blogModules, 'blog')
export const allPosts: PostMeta[] = [...projects, ...blogPosts].sort((a, b) => (b.date > a.date ? 1 : -1))
