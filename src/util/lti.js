import jwt from 'jsonwebtoken'
const custom = 'https://purl.imsglobal.org/spec/lti/claim/custom'
const deepLinkingSettings = 'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'
const deploymentId = 'https://purl.imsglobal.org/spec/lti/claim/deployment_id'
const messageType = 'https://purl.imsglobal.org/spec/lti/claim/message_type'
const version = 'https://purl.imsglobal.org/spec/lti/claim/version'
const contentItems = 'https://purl.imsglobal.org/spec/lti-dl/claim/content_items'
const agsEndpoint = 'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'
const launchPresentation = 'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'

export function username(claims) {
  return claims[custom]?.username
}

export function deepLinkReturnUrl(claims) {
  return claims[deepLinkingSettings]?.deep_link_return_url
}

export function lineItemEndpoint(claims) {
  return claims[agsEndpoint]?.lineitem
}

export function launchPresentationReturnUrl(claims) {
  return claims[launchPresentation]?.return_url
}

export function resourceLinkFor({secrets, claims, contentItem}) {
  const jwtContents = {
    iss: secrets.clientId,
    aud: claims.iss,
    nonce: secrets.nonce,
    [messageType]: 'LtiDeepLinkingResponse',
    [version]: '1.3.0',
    [deploymentId]: claims[deploymentId],
    [contentItems]: [contentItem]
  }
  return jwt.sign(jwtContents, secrets.privateKey, {
    algorithm: 'RS256',
    expiresIn: '1h'
  })
}
