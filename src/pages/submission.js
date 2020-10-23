import {getClaims} from '../util/session'
import cats from '../util/cats'
import secrets from '../util/secrets'

export async function getServerSideProps({req, res, query}) {
  const claims = await getClaims(req, res)
  const {id, key, userId, likeScore, comment} = query
  return {
    props: {
      claims,
      secrets,
      id: id ?? null,
      catKey: key,
      userId,
      likeScore,
      comment
    }
  }
}

export default function Home({
  claims,
  clientId,
  privateKey,
  nonce,
  catKey,
  id = 'cat',
  userId,
  likeScore,
  comment
}) {
  const cat = cats[catKey]
  return (
    <div className="container">
      <p>
        This is assignment {id} for {userId}.
      </p>

      <p>
        {cat.label}
        <br></br>
        <img src={cat.url} />
      </p>

      <form id="evalForm">
        <label>
          Do you like the cat? <br />
          <b>{likeScore} / 10</b>
        </label>
        <br />
        <label>
          Say something nice to the cat. <br />
          <b>{comment}</b>
        </label>
      </form>
      <pre>LTI Claims:</pre>
      <pre>{JSON.stringify(claims, null, '  ')}</pre>
    </div>
  )
}
