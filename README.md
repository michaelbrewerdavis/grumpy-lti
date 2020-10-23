# Grumpy LTI 1.3 Example

NextJS example of an LTI 1.3 tool with several placements set up for Canvas.

Secrets are for a dev environment and are obviously not secret.

## Some notes on implementing LTI 1.3 tool

### Support launch flow

See [LTI OpenID Connect Launch Flow](http://www.imsglobal.org/spec/security/v1p0/#openid_connect_launch_flow) and [LTI Launch Details](http://www.imsglobal.org/spec/lti/v1p3/#general-lti-launch-details).
Handled here in `src/pages/api/lti.js`.

1. LMS makes a LTI resource link launch request
   - unsecured
2. Tool redirects with an authentication request
   - LMS may then go through its own auth flow
3. LMS makes an authentication callback
   - includes signed jwt to be verified by tool
4. Tool redirects to the requested resource

### Support basic placements/LtiResourceLinkRequest

As the tool redirects to the resource, it can store the LTI claims, using those to authenticate against the tool and personalize/contextualize the resource.

### Support deep linking/LtiDeepLinkingRequest

In this case, one of the LTI claims will be `deep_link_return_url`. When the user has used the tool to choose a resource, the tool should post the content as an ltiResourceLink to the return URL (via a signed JWT parameter)

### Support Assignment & Grading Services

When the user visits a deeply linked assignment, an AGS claim for `lineitem` will be present, that can then be used to make API requests. Requests are encrypted using the tool's published JWK keyset.
For example, Canvas allows a submission to be attached to an assignment [via its score service](https://canvas.instructure.com/doc/api/score.html#method.lti/ims/scores.create). If the submission is attached with type `basic_lti_launch` and a URL, Canvas will display the URL (via an LtiResourceLinkRequest, as above) in its grading and submission pages.
