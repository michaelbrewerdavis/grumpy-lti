const {Issuer, generators} = require('openid-client')
import {withSession} from 'next-session'
import {sessionOptions} from '../../util/session'

const messageType = 'https://purl.imsglobal.org/spec/lti/claim/message_type'
const targetLinkUri = 'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'

const Canvas = new Issuer({
  issuer: 'https://canvas.instructure.com',
  authorization_endpoint: 'https://canvas.docker/api/lti/authorize_redirect',
  jwks_uri: 'https://canvas.docker/api/lti/security/jwks'
})

const client = new Canvas.Client({
  client_id: process.env.CANVAS_CLIENT_ID,
  client_secret: process.env.CANVAS_CLIENT_SECRET,
  redirect_uris: ['https://grumpycat.docker/api/lti'],
  response_types: ['code']
})

async function handleInitiateLogin(req, res) {
  try {
    const {client_id, login_hint, lti_message_hint} = req.body

    const nonce = generators.nonce()
    const redirect = client.authorizationUrl({
      scope: 'openid',
      response_type: 'id_token',
      response_mode: 'form_post',
      prompt: 'none',
      client_id,
      login_hint,
      lti_message_hint,
      nonce
    })

    req.session.nonce = nonce
    await req.session.commit()

    res.redirect(303, redirect)
  } catch (error) {
    console.log(error)
    res.json({error: error.message, stack: error.stack})
  }
}

async function handleAuthenticationResponse(req, res) {
  try {
    const {nonce} = req.session
    const keys = await Canvas.keystore()

    const client = new Canvas.Client({
      client_id: process.env.CANVAS_CLIENT_ID,
      client_secret: process.env.CANVAS_CLIENT_SECRET,
      redirect_uris: ['https://grumpycat.docker/api/lti'],
      response_types: ['code'],
      jwks: keys
    })

    const tokenSet = await client.oauthCallback('https://grumpycat.docker/api/lti', req.body, {
      response_type: 'id_token',
      nonce
    })
    const claims = tokenSet.claims()

    req.session.claims = claims
    await req.session.commit()

    if (
      claims[messageType] === 'LtiResourceLinkRequest' ||
      claims[messageType] === 'LtiDeepLinkingRequest'
    ) {
      res.redirect(303, claims[targetLinkUri])
    } else {
      res.json({claims})
    }
  } catch (error) {
    console.log(error)
    res.json({error: error.message, stack: error.stack})
  }
}

async function handler(req, res) {
  if (req.body.login_hint) {
    await handleInitiateLogin(req, res)
  } else if (req.body.id_token) {
    await handleAuthenticationResponse(req, res)
  } else {
    res.json({error: 'unrecognized message'})
  }
}

export default withSession(handler, sessionOptions)
