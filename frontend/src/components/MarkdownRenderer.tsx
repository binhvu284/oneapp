import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import styles from './MarkdownRenderer.module.css'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize rendering for specific elements
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
              <pre className={styles.codeBlock}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className={styles.inlineCode} {...props}>
                {children}
              </code>
            )
          },
          table({ children }) {
            return (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>{children}</table>
              </div>
            )
          },
          ul({ children }) {
            return <ul className={styles.list}>{children}</ul>
          },
          ol({ children }) {
            return <ol className={styles.orderedList}>{children}</ol>
          },
          blockquote({ children }) {
            return <blockquote className={styles.blockquote}>{children}</blockquote>
          },
          h1({ children }) {
            return <h1 className={styles.h1}>{children}</h1>
          },
          h2({ children }) {
            return <h2 className={styles.h2}>{children}</h2>
          },
          h3({ children }) {
            return <h3 className={styles.h3}>{children}</h3>
          },
          h4({ children }) {
            return <h4 className={styles.h4}>{children}</h4>
          },
          p({ children }) {
            return <p className={styles.paragraph}>{children}</p>
          },
          a({ href, children }) {
            return (
              <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

