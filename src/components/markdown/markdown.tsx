import ReactMarkdown from 'react-markdown'
import './markdown.scss'

interface Props {
  /** The markdown source to render. */
  text: string
}

/**
 * Renders the given block of markdown text.
 */
export function Markdown({ text }: Props) {
  return (
    <div className="markdown">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  )
}
