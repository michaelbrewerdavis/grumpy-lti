import {applySession} from 'next-session'

export const sessionOptions = {
  cookie: {
    sameSite: 'None',
    secure: true
  }
}

export async function getClaims(req, res) {
  await applySession(req, res, sessionOptions)
  req.session.destroy()

  return req.session.claims || {}
}
