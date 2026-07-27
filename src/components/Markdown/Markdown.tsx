import ReactMarkdown from 'react-markdown'

interface Props {
  /** The markdown source to render. */
  text: string
}

/**
 * Renders the given block of markdown text.
 */
export default function Markdown({ text }: Props) {
  return (
    <div className="markdown">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  )
}
