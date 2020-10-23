import {generators} from 'openid-client'

export default {
  clientId: process.env.CANVAS_CLIENT_ID,
  clientSecret: process.env.CANVAS_CLIENT_SECRET,
  privateKey: process.env.PRIVATE_KEY,
  nonce: generators.nonce()
}
