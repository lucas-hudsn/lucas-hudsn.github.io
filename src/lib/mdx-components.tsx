import type { ComponentPropsWithoutRef } from 'react'
import CodeBlock from '../components/CodeBlock'

export const mdxComponents = {
  pre: (props: ComponentPropsWithoutRef<'pre'>) => <CodeBlock {...props} />,
  img: (props: ComponentPropsWithoutRef<'img'>) => (
    <img {...props} loading="lazy" style={{ maxWidth: '100%', height: 'auto' }} />
  ),
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div style={{ overflowX: 'auto' }}>
      <table {...props} />
    </div>
  ),
  a: (props: ComponentPropsWithoutRef<'a'>) => {
    const isExternal = props.href?.startsWith('http')
    return <a {...props} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} />
  },
}
