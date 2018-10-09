import React from 'react'
import Section from '../components/Section'
import Code from '../components/Code'
import Paragraph from '../lib/Paragraph'
import Heading from '../lib/Heading'
import { FormButton } from '../lib/Form'
import { Link } from 'react-router-dom'

export default function PageForm() {
  return (
    <div className="Page">
      <Section>
        <Heading size="huge">Form</Heading>
        <Paragraph>
          The Form component contains several types of sub-components that are
          useful for gathering user input. They can be used either independetly
          or as part of an actual HTML form.
        </Paragraph>
        <Paragraph>
          <ul>
            <li>
              <Link to="/form#button">Button</Link>
            </li>
          </ul>
        </Paragraph>
      </Section>
      <Section id="button">
        <Heading size="large">Button</Heading>
        <Code
          name="ButtonDefault"
          defaultValue={`<FormButton>Click me</FormButton>`}
        />
        <FormButton>Click me</FormButton>

        <Section>
          <Heading size="medium">Looks</Heading>
          <Paragraph>Buttons can appear in three different variants.</Paragraph>
          <Section>
            <Heading size="small">Minimal</Heading>
            <Paragraph>
              The minimal button is best used in conjunction with a primary
              action, for example save. The minimal button would then be a
              secondary actionm, such as to cancel.
            </Paragraph>
            <Code
              name="ButtonLookMininmal"
              defaultValue={`<FormButton look="minimal">Cancel</FormButton>`}
            />
            <FormButton look="minimal">Cancel</FormButton>
          </Section>
          <Section>
            <Heading size="small">Mini</Heading>
            <Code
              name="ButtonLookMini"
              defaultValue={`<FormButton look="mini">Click me</FormButton>`}
            />
            <FormButton look="mini">Click me</FormButton>
          </Section>
        </Section>

        <Section>
          <Heading size="medium">States</Heading>
          <Paragraph>
            Buttons have multiple states to indicate the status of network
            requests. These include loading, success, and error.
          </Paragraph>
          <Section>
            <Heading size="small">Loading</Heading>
            <Code
              name="ButtonStatesLoading"
              defaultValue={`<FormButton state="loading">Click me</FormButton>`}
            />
            <FormButton state="loading">Saving</FormButton>
          </Section>
          <Section>
            <Heading size="small">Success</Heading>
            <Code
              name="ButtonStatesSuccess"
              defaultValue={`<FormButton state="success">Saved</FormButton>`}
            />
            <FormButton state="success">Saved</FormButton>
          </Section>
          <Section>
            <Heading size="small">Error</Heading>
            <Code
              name="ButtonStatesError"
              defaultValue={`<FormButton state="error">Errored</FormButton>`}
            />
            <FormButton state="error">Errored</FormButton>
          </Section>
        </Section>
      </Section>
    </div>
  )
}
