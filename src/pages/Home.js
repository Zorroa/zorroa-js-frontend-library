import React from 'react'
import Paragraph from '../lib/Paragraph'
import Heading from '../lib/Heading'

export default function Home() {
  return (
    <div className="Page">
      <Heading>Zorroa Design Library</Heading>
      <Paragraph>
        Common UI elements that are used in Zorroa frontend web apps can be
        found here. This project uses semantic versioning, large version changes
        can break Javascript API-compailbility. We do not version CSS changes,
        instead the advice is to not override CSS, or do so at your own risk.
      </Paragraph>
    </div>
  )
}
