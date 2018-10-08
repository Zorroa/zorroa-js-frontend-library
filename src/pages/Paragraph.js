import React from 'react'
import Section from '../components/Section'
import Code from '../components/Code'
import Paragraph from '../lib/Paragraph'
import Heading from '../lib/Heading'

export default function PageParagraph() {
  return (
    <div className="Page">
      <Section>
        <Heading size="huge">Paragraph</Heading>
        <Paragraph>
          A block of text can be placed inside of a Paragraph component.
        </Paragraph>
      </Section>
      <Section>
        <Heading size="large">Normal Paragraph</Heading>
        <Code
          name="ParagraphNormal"
          defaultValue={`
<Paragraph>
  This is an example of a paragraph with a normal size.
</Paragraph>`}
        />

        <Paragraph>
          This is an example of a paragraph with a normal size.
        </Paragraph>
      </Section>
      <Section>
        <Heading size="large">Large Paragraph</Heading>
        <Code
          name="ParagraphLarge"
          defaultValue={`
<Paragraph size="large">
  This is an example of a paragraph with a large size.
</Paragraph>`}
        />
        <Paragraph size="large">
          This is an example of a paragraph with a large size.
        </Paragraph>
      </Section>
      <Section>
        <Heading size="large">Small Paragraph</Heading>
        <Code
          name="ParagraphSmall"
          defaultValue={`
<Paragraph size="small">
  This is an example of a paragraph with a small size.
</Paragraph>`}
        />
        <Paragraph size="small">
          This is an example of a paragraph with a small size.
        </Paragraph>
      </Section>
    </div>
  )
}
