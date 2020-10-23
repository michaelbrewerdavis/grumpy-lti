import Head from 'next/head'
import {getClaims} from '../util/session'

import cats from '../util/cats'

const custom = 'https://purl.imsglobal.org/spec/lti/claim/custom'

export async function getServerSideProps({req, res}) {
  const claims = await getClaims(req, res)

  return {
    props: {
      claims
    }
  }
}

export default function Index({claims}) {
  const username = claims[custom]?.username || 'Stranger'
  return (
    <div className="container">
      <Head>
        <title>GrumpyCat</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>

      <p>Hello, {username}!</p>
      {Object.entries(cats).map(([key, {label, url}]) => (
        <p key={key}>
          {label}
          <br></br>
          <img src={url} alt={label} />
        </p>
      ))}
      <p>LTI Claims:</p>
      <pre>{JSON.stringify(claims, null, '  ')}</pre>
    </div>
  )
}
