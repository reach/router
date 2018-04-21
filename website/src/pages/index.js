import React from 'react'
import Link from 'gatsby-link'
const IndexPage = () => (
  <div>
    <div css={{ padding: '60px 0' }}>
      <h1 css={{ textAlign: 'center', margin: '20px' }}>Reactions Router</h1>
      <p css={{ textAlign: 'center' }}>
        Next generation routing for React from{' '}
        <a href="http://ryanflorence.com">Ryan Florence</a>.
      </p>
      <ul css={{ margin: 'auto', maxWidth: '600px' }}>
        <li>Dead simple API, mostly non-existent</li>
        <li>React Async ready, compatible with React 14+</li>
        <li>Pretty small, less than 4 kb</li>
        <li>
          Takes the best ideas from React Router v3 and v4, smooths out some
          rough edges with some new ideas
        </li>
        <li>
          Relative links let you build large-scale web apps. They simplify code
          splitting, allow teams to work on parts of the app independently, and
          even let you embed entire apps within other apps effortlessly. (The
          best way to build really big apps is to not to--compose small ones!)
        </li>
        <li>
          It ranks routes and picks the best match, no messing around with route
          ordering or partial path matching.
        </li>
        <li>AND MORE! ofc ... there's always more.</li>
      </ul>
    </div>
    <iframe
      title="example"
      src="https://codesandbox.io/embed/kwo3l22z0r?fontsize=12"
      css={{ width: '100%', border: 0, height: '90vh' }}
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    />
    <div
      css={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px',
      }}
    >
      <h2 css={{ margin: '0' }}>Examples</h2>
      <span>Basic</span>
      <span>CRUD</span>
      <span>Query Strings</span>
      <span>Authentication</span>
      <span>Animation</span>
      <span>Multiple Routers</span>
      <span>Nested Routers</span>
    </div>
  </div>
)

export default IndexPage
