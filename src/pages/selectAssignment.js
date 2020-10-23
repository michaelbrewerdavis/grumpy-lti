import Head from 'next/head'
import {getClaims} from '../util/session'
import cats from '../util/cats'
import secrets from '../util/secrets'
import * as lti from '../util/lti'

export async function getServerSideProps({req, res}) {
  const claims = await getClaims(req, res)
  return {
    props: {
      claims,
      secrets
    }
  }
}

export default function SelectAssignment({claims, secrets}) {
  const returnUrl = lti.deepLinkReturnUrl(claims)

  const choose = (key) => {
    const id = Math.floor(Math.random() * 100000)

    const contentItem = {
      type: 'ltiResourceLink',
      title: cats[key].label,
      text: `Wasn't "${cats[key].label}" enough info?`,
      url: `https://grumpycat.docker/assignment?id=${id}&key=${key}`
    }
    const jwt = lti.resourceLinkFor({secrets, claims, contentItem})
    document.getElementById('returnFormJwt').value = jwt
    document.getElementById('returnForm').submit()
  }

  return (
    <div className="container">
      {Object.entries(cats).map(([key, {label, url}]) => (
        <p key={key}>
          <button key={key} onClick={() => choose(key)}>
            {label}
          </button>
          <br></br>
          <img src={url} />
        </p>
      ))}

      <form id="returnForm" action={returnUrl} method="post" style={{display: 'none'}}>
        <input id="returnFormJwt" name="JWT" />
      </form>
      <p>LTI Claims:</p>
      <pre>{JSON.stringify(claims, null, '  ')}</pre>
    </div>
  )
}
