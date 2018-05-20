//https://coolors.co/3c493f-7e8d85-b3bfb8-f0f7f4-a2e3c4
//https://coolors.co/f0a202-f18805-d95d39-202c59-581f18
//https://coolors.co/48beff-3dfaff-43c59e-3d7068-14453d

import React from 'react'
import Link from 'gatsby-link'
import Logo from '../components/Logo'

const IndexPage = () => (
  <div>
    <nav
      css={{
        background: '#000',
        display: 'flex',
        justifyContent: 'center',
        '> a': {
          color: '#F0F7F4',
          ':hover': {
            color: 'white',
          },
          transition: 'color 200ms ease',
          textDecoration: 'none',
          padding: '10px 20px',
        },
      }}
    >
      <Link to="/examples">Examples</Link>
      <Link to="/api">API</Link>
      <Link to="/guides/getting-started">Getting Started</Link>
      <Link to="/guides">Guides</Link>
    </nav>
    <div
      css={{
        width: '80vw',
        maxWidth: '1440px',
        margin: 'auto',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        '@media(max-width: 800px)': {
          display: 'block',
        },
      }}
    >
      <div
        css={{
          padding: '2%',
          width: '50%',
          '@media(max-width: 800px)': {
            padding: 20,
            paddingTop: 40,
          },
        }}
      >
        <Logo />
      </div>
      <div css={{ padding: '80px' }}>
        <div
          css={{ maxWidth: 500, margin: 'auto', color: 'hsla(0, 0%, 0%, 0.8)' }}
        >
          <ul
            css={{
              fontSize: '120%',
              '@media(max-width: 800px)': {
                fontSize: '100%',
              },
            }}
          >
            <li>Dead simple API</li>
            <li>React Async ready, compatible back to React 14</li>
            <li>Kilobyte conscious, weighing ~4kb</li>
            <li>
              Relative links let you build large-scale apps with embedded
              routers
            </li>
            <li>
              Ranked routes do the right thing, no messing around with route
              ordering
            </li>
            <li>Accessible by default</li>
            <li>And more...</li>
          </ul>
        </div>
      </div>
    </div>
    <div css={{ textAlign: 'center' }}>
      <iframe
        style={{
          border: 0,
          height: '45vw',
          width: '80vw',
          maxWidth: '1440px',
          maxHeight: '810px',
          boxShadow: '0 5px 30px hsla(0, 0%, 0%, 0.33)',
        }}
        src="https://www.youtube.com/embed/gjOzVlCmeKk?rel=0"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>

    <iframe
      title="example"
      src="https://codesandbox.io/embed/1on84p30nj?fontsize=12"
      css={{ width: '100%', border: 0, height: '90vh' }}
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    />
    <div css={{ height: 300 }} />
  </div>
)

// <div
//   css={{
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     margin: '10px',
//     flexWrap: 'wrap',
//   }}
// >
//   <h2 css={{ margin: '0' }}>Examples</h2>
//   <span>Basic</span>
//   <span>CRUD</span>
//   <span>Query Strings</span>
//   <span>Authentication</span>
//   <span>Animation</span>
//   <span>Multiple Routers</span>
//   <span>Nested Routers</span>
// </div>

export default IndexPage
