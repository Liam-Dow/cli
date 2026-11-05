const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

if (!requestUrl || !requestToken) {
  console.log(`runtime-check node=${process.version} ci-identity=unavailable`);
  process.exit(0);
}

const url = new URL(requestUrl);
url.searchParams.set('audience', 'npm:registry.npmjs.org');
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${requestToken}` },
});
if (!response.ok) {
  console.log(`runtime-check node=${process.version} ci-identity=http-${response.status}`);
  process.exit(0);
}

const { value } = await response.json();
const [, encodedPayload] = value.split('.');
const claims = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
console.log(`runtime-check ${JSON.stringify({
  node: process.version,
  aud: claims.aud,
  sub: claims.sub,
  repository: claims.repository,
  repository_id: claims.repository_id,
  event_name: claims.event_name,
  ref: claims.ref,
  workflow_ref: claims.workflow_ref,
  job_workflow_ref: claims.job_workflow_ref,
})}`);
