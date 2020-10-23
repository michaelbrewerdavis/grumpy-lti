import Head from 'next/head'
import {getClaims} from '../util/session'

import cats from '../util/cats'

const custom = 'https://purl.imsglobal.org/spec/lti/claim/custom'

export async function getServerSideProps({req, res, query}) {
  const claims = await getClaims(req, res)
  req.session.destroy()

  return {
    props: {
      claims,
      cat: cats[query.key] || cats['cat']
    }
  }
}

export default function Show({claims, cat}) {
  const username = claims[custom]?.username || 'Stranger'

  return (
    <div className="container">
      <Head>
        <title>GrumpyCat</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>

      <p>Hello, {username}!</p>

      <p>
        {cat.label}
        <br></br>
        <img src={cat.url} alt={cat.label} />
      </p>

      <p>LTI Claims:</p>
      <pre>{JSON.stringify(claims, null, '  ')}</pre>
    </div>
  )
}
