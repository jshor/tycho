import React from 'react'
import { PageText } from '../../types'

interface Props {
  pageText: PageText
}

export default class NoWebGL extends React.Component<Props> {
  render() {
    const { webgl } = this.props.pageText
    return (
      <div className="no-webgl">
        <div className="no-webgl__body">
          <span className="no-webgl__title">{webgl.noWebGl}</span>
          <p>
            {webgl.required}
            <br />
            <a href={webgl.enableInstructionsUrl} target="_blank" className="no-webgl__anchor">
              {webgl.clickHere}
            </a>
            &nbsp;
            {webgl.learn}
          </p>
        </div>
      </div>
    )
  }
}
