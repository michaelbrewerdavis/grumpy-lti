import {getClaims} from '../util/session'
import cats from '../util/cats'
import * as lti from '../util/lti'

export async function getServerSideProps({req, res, query}) {
  const claims = await getClaims(req, res)
  const {id, key} = query
  return {
    props: {
      claims,
      id,
      catKey: key
    }
  }
}

export default function Home({claims, catKey, id}) {
  const lineItemEndpoint = lti.lineItemEndpoint(claims)
  const returnUrl = lti.launchPresentationReturnUrl(claims)

  const username = lti.username(claims) || 'Stranger'
  const cat = cats[catKey]

  return (
    <div className="container">
      <p>
        Hello, {username}! This is assignment {id}.
      </p>

      <p>
        {cat.label}
        <br></br>
        <img src={cat.url} />
      </p>

      <form id="evalForm" action="https://grumpycat.docker/api/submit" method="POST">
        <label>
          Do you like the cat? <br />
          <input name="likeScore" type="range" min="0" max="10" />
        </label>
        <br />
        <label>
          Say something nice to the cat. <br />
          <input name="comment" type="text" />
        </label>
        <input type="hidden" name="endpoint" value={lineItemEndpoint} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="userId" value={claims.sub} />
        <input type="hidden" name="key" value={catKey} />
        <input type="hidden" name="returnUrl" value={returnUrl} />
        <br />
        <button type="submit">Submit</button>
      </form>
      <p>LTI Claims:</p>
      <pre>{JSON.stringify(claims, null, '  ')}</pre>
    </div>
  )
}
