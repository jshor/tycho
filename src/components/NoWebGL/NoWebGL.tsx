import { PageText } from '../../types'

interface Props {
  /** The translated page text for the app. */
  pageText: PageText
}

/**
 * The fallback shown when the browser cannot render WebGL.
 */
export default function NoWebGL({ pageText }: Props) {
  const { webgl } = pageText

  return (
    <div className="no-webgl">
      <div className="no-webgl__body">
        <span className="no-webgl__title">{webgl.noWebGl}</span>
        <p>
          {webgl.required}
          <br />
          <a
            href={webgl.enableInstructionsUrl}
            target="_blank"
            rel="noreferrer"
            className="no-webgl__anchor"
          >
            {webgl.clickHere}
          </a>
          &nbsp;
          {webgl.learn}
        </p>
      </div>
    </div>
  )
}
