const {Issuer, generators} = require('openid-client')
import {withSession} from 'next-session'
import {sessionOptions} from '../../util/session'
import jwt from 'jsonwebtoken'

async function handler(req, res) {
  try {
    const {userId, endpoint, key, likeScore, comment, id, returnUrl} = req.body

    const jwtContents = {
      iss: process.env.CANVAS_CLIENT_ID,
      sub: process.env.CANVAS_CLIENT_ID,
      aud: 'https://canvas.docker/login/oauth2/token',
      jti: generators.nonce()
    }
    const jwtString = jwt.sign(jwtContents, process.env.PRIVATE_KEY, {
      algorithm: 'RS256',
      expiresIn: '1h'
    })
    const response = await fetch('https://canvas.docker/login/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwtString,
        scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score'
      })
    })

    console.log(response)
    const json = await response.json()
    console.log(json)
    const {access_token, token_type} = json

    const scoreResponse = await fetch(`${endpoint}/scores`, {
      method: 'POST',
      headers: {
        Authorization: `${token_type} ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        activityProgress: 'Submitted',
        gradingProgress: 'PendingManual',
        timestamp: new Date().toISOString(),
        'https://canvas.instructure.com/lti/submission': {
          submission_type: 'basic_lti_launch',
          submission_data: `https://grumpycat.docker/submission?id=${id}&userId=${userId}&key=${key}&likeScore=${likeScore}&comment=${comment}`
        }
      })
    })
    console.log('status', scoreResponse.status)
    const scoreJson = await scoreResponse.json()
    console.log(scoreJson)
    if (returnUrl) {
      res.redirect(303, returnUrl)
    } else {
      res.json({submitted: true})
    }
  } catch (error) {
    console.log(error)
    res.json({error: error.message, stack: error.stack})
  }
}

export default withSession(handler, sessionOptions)
