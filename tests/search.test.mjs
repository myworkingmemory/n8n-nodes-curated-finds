import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { CuratedFinds } = require('../dist/nodes/CuratedFinds/CuratedFinds.node.js');
const { CuratedFindsApi } = require('../dist/credentials/CuratedFindsApi.credentials.js');
const { CuratedFindsRapidApi } = require('../dist/credentials/CuratedFindsRapidApi.credentials.js');
const rapidCredential = new CuratedFindsRapidApi();
const { Workflow, NodeHelpers } = require('n8n-workflow');
const { RoutingNode } = require('../node_modules/n8n-core/dist/execution-engine/routing-node.js');
const nodeType = new CuratedFinds();
const credential = new CuratedFindsApi();
const defaults = Object.fromEntries(nodeType.description.properties.map(p => [p.name, p.default]));
const page = () => ({ version: 'fixture-v1', total: 233, records: [{ id: 'github:speechbrain/speechbrain', name: 'SpeechBrain', sourceURL: 'https://github.com/speechbrain/speechbrain', reviewedAt: '2026-10-16', evidenceLimits: ['Source review only.'] }], nextOffset: 1, remaining: 999 });

function setup(parameters = {}, response = page(), failure) {
  const node = { id: 'fixture-node', name: 'Curated Finds', type: 'n8n-nodes-curated-finds.curatedFinds', typeVersion: 1, position: [0, 0], parameters: { ...defaults, ...parameters } };
  const workflow = new Workflow({ id: 'fixture-workflow', nodes: [node], connections: {}, active: false, nodeTypes: { getByNameAndVersion: () => nodeType, getKnownTypes: () => ({}) } });
  const credentialReads = [];
  const context = { node, nodeType, workflow, mode: 'manual', connectionInputData: [{ json: {} }], runExecutionData: null, getNodeParameter: name => node.parameters[name], getCredentials: async name => { credentialReads.push(name); return { apiKey: 'fixture-only' }; } };
  const calls = [];
  const single = {
    getNode: () => node,
    getNodeParameter: name => node.parameters[name],
    getExecuteData: () => undefined,
    helpers: {
      httpRequest: () => { throw new Error('Unauthenticated transport must not be used'); },
      async httpRequestWithAuthentication(name, options, extra) {
        calls.push({ name, options: structuredClone(options), extra });
        if (failure) throw failure;
        return { statusCode: 200, headers: {}, body: response };
      },
    },
  };
  const routing = new RoutingNode(context, nodeType);
  const data = { options: { qs: {}, body: {}, ...structuredClone(nodeType.description.requestDefaults) }, preSend: [], postReceive: [], requestOperations: {} };
  for (const p of nodeType.description.properties) {
    const mapped = routing.getRequestOptionsFromParameters(single, p, 0, 0, '', { $value: node.parameters[p.name], $version: 1 });
    routing.mergeOptions(data, mapped);
  }
  return { node, workflow, single, routing, data, calls, credentialReads, run: async () => { const { credentialDescription } = await routing.prepareCredentials(); return routing.makeRequest(data, single, 0, 0, credentialDescription.name, data.requestOperations); } };
}

test('native n8n routing maps a single authenticated bounded GET and retains the page envelope', async () => {
  const h = setup({ query: 'SpeechBrain & audio', pageSize: 3, category: 'Audio & recordings', platform: 'Local CPU; GPU optional', offset: 2 });
  const result = await h.run();
  assert.equal(h.calls.length, 1);
  const { name, options } = h.calls[0];
  assert.equal(name, 'curatedFindsApi');
  assert.equal(options.baseURL, 'https://www.myworkingmemory.ai/api/software-library/direct');
  assert.equal(options.url, '/search');
  assert.equal(options.method, 'GET');
  assert.deepEqual(options.qs, { query: 'SpeechBrain & audio', limit: 3, category: 'Audio & recordings', platform: 'Local CPU; GPU optional', offset: 2 });
  assert.equal(options.disableFollowRedirect, true);
  assert.equal(options.maxRedirects, 0);
  assert.equal(options.timeout, 30000);
  assert.equal(options.maxResponseBodyBytes, 1048576);
  assert.deepEqual(result, [{ json: page() }]);
  assert.equal(h.data.paginate, undefined);
  assert.deepEqual(h.data.requestOperations, {});
});

test('empty matches remain a successful charged page with remaining allowance', async () => {
  const response = { version: 'fixture-v1', total: 0, records: [], nextOffset: null, remaining: 7 };
  const h = setup({}, response);
  assert.deepEqual(await h.run(), [{ json: response }]);
  assert.equal(h.calls.length, 1);
});

test('nextOffset does not trigger another HTTP request', async () => {
  const h = setup({}, { ...page(), nextOffset: 10 });
  await h.run();
  assert.equal(h.calls.length, 1);
});

test('invalid expression-derived bounds fail before any metered HTTP request', async () => {
  for (const parameters of [{ pageSize: 0 }, { pageSize: 26 }, { pageSize: 1.5 }, { pageSize: NaN }, { offset: -1 }, { offset: 10001 }, { offset: 2.5 }, { query: 'x'.repeat(201) }, { category: 'x'.repeat(101) }, { platform: 'x'.repeat(101) }, { query: [] }]) {
    const h = setup(parameters);
    await assert.rejects(h.run());
    assert.equal(h.calls.length, 0);
  }
});

test('HTTP failures and timeouts propagate once without an implicit retry', async () => {
  for (const code of ['401', '429', '503', 'ETIMEDOUT']) {
    const failure = new Error(code);
    const h = setup({}, undefined, failure);
    await assert.rejects(h.run(), e => e === failure);
    assert.equal(h.calls.length, 1);
  }
});

test('malformed successful responses fail visibly instead of becoming empty shortlists', async () => {
  for (const response of [{ error: 'subscription_required' }, { ...page(), remaining: -1 }, { ...page(), records: Array(11).fill({}) }, { ...page(), version: '' }, { ...page(), nextOffset: '10' }]) {
    const h = setup({}, response);
    await assert.rejects(h.run(), /unexpected response/);
    assert.equal(h.calls.length, 1);
  }
});

test('credential auth uses the encrypted credential expression and has no secret default', () => {
  const secret = credential.properties.find(p => p.name === 'apiKey');
  assert.equal(secret.typeOptions.password, true);
  assert.equal(secret.default, '');
  assert.equal(secret.required, true);
  assert.deepEqual(credential.authenticate, { type: 'generic', properties: { headers: { Authorization: '=Bearer {{$credentials.apiKey}}' } } });
  assert.equal(credential.test.request.method, 'GET');
});

test('single service discovery metadata and AI-tool support are exposed', () => {
  assert.equal(nodeType.description.usableAsTool, true);
  assert.deepEqual(nodeType.description.credentials.map(c => c.name), ['curatedFindsApi', 'curatedFindsRapidApi']);
  assert.equal(nodeType.description.properties.find(p => p.name === 'operation').options.length, 1);
});

test('manual example has no credentials, pinData, active schedule or retry setting', () => {
  const example = JSON.parse(readFileSync(new URL('../examples/search-software.json', import.meta.url)));
  assert.equal(example.active, false);
  assert.equal(example.nodes[0].type, 'n8n-nodes-base.manualTrigger');
  const search = example.nodes.find(n => n.type === 'n8n-nodes-curated-finds.curatedFinds');
  assert.ok(search);
  assert.equal(search.retryOnFail, false);
  assert.equal(search.executeOnce, true);
  for (const node of example.nodes) assert.equal(node.credentials, undefined);
  assert.deepEqual(example.pinData, {});
});


test('credential test is one fixed, bounded authenticated search with visible lookup notice', async () => {
  const h = setup({ pageSize: 1 });
  h.data.options = structuredClone(credential.test.request);
  h.data.preSend = [];
  await h.run();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].name, 'curatedFindsApi');
  const request = h.calls[0].options;
  assert.equal(request.baseURL, 'https://www.myworkingmemory.ai/api/software-library/direct');
  assert.equal(request.url, '/search');
  assert.deepEqual(request.qs, { query: 'n8n', limit: 1, offset: 0 });
  assert.equal(request.disableFollowRedirect, true);
  assert.equal(request.maxResponseBodyBytes, 1048576);
  assert.equal(request.timeout, 30000);
  assert.match(credential.properties.find(p => p.name === 'testNotice').displayName, /one included subscription lookup per test/);
});


test('final pre-send timeout overrides the native routing engine five-minute default', async () => {
  const h = setup();
  h.data.options.timeout = 300000;
  await h.run();
  assert.equal(h.calls[0].options.timeout, 30000);
});

test('AI output modes retain coverage, allowance and essential evidence without another request', async () => {
  const record = { ...page().records[0], purpose: 'Separate voices', type: 'Python component', category: 'Audio & recordings', platforms: ['Python'], getSoftwareURL: 'https://github.com/speechbrain/speechbrain', licenseDeclaration: 'Apache-2.0', licenseURL: 'https://github.com/speechbrain/speechbrain/blob/develop/LICENSE', requirements: 'Python and matching audio dependencies' };
  for (const output of ['raw', 'simplified', 'selected']) {
    const h = setup({ output, fields: ['name', 'platforms'] }, { ...page(), records: [record] });
    const [{ json }] = await h.run();
    assert.equal(h.calls.length, 1);
    for (const key of ['version', 'total', 'nextOffset', 'remaining']) assert.deepEqual(json[key], page()[key]);
    for (const key of ['id', 'sourceURL', 'reviewedAt', 'evidenceLimits']) assert.deepEqual(json.records[0][key], record[key]);
    if (output === 'raw') assert.deepEqual(json.records[0], record);
    if (output === 'simplified') assert.equal(Object.keys(json.records[0]).length, 10);
    if (output === 'selected') assert.deepEqual(Object.keys(json.records[0]), ['id', 'sourceURL', 'reviewedAt', 'evidenceLimits', 'name', 'platforms']);
  }
});

test('the actual n8n package loader registers this node and credential without a network call', async () => {
  const { PackageDirectoryLoader } = require('../node_modules/n8n-core/dist/nodes-loader/package-directory-loader.js');
  const loader = new PackageDirectoryLoader(process.cwd());
  await loader.loadAll();
  assert.deepEqual(Object.keys(loader.nodeTypes), ['curatedFinds']);
  assert.deepEqual(Object.keys(loader.credentialTypes), ['curatedFindsApi', 'curatedFindsRapidApi']);
  assert.deepEqual(loader.known.credentials.curatedFindsApi.supportedNodes, ['curatedFinds']);
});


test('RapidAPI uses its own credential and fixed gateway, with no invented quota', async () => {
  const response = { version: 'fixture-v1', total: 12, records: page().records };
  const h = setup({ authentication: 'rapidapi', query: 'SpeechBrain', pageSize: 1, offset: 2 }, response);
  assert.equal(h.data.options.baseURL, 'https://software-library-search.p.rapidapi.com');
  assert.equal(h.routing.resolveBaseUrl(0, 0, undefined, h.single, { $parameter: {}, $rawParameter: {} }), 'https://software-library-search.p.rapidapi.com');
  const [{ json }] = await h.run();
  assert.deepEqual(h.credentialReads, ['curatedFindsRapidApi']);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].name, 'curatedFindsRapidApi');
  assert.equal(h.calls[0].options.baseURL, 'https://software-library-search.p.rapidapi.com');
  assert.equal(h.calls[0].options.url, '/search');
  assert.equal(h.calls[0].options.disableFollowRedirect, true);
  assert.equal(h.calls[0].options.timeout, 30000);
  assert.equal(json.nextOffset, 3);
  assert.equal(Object.hasOwn(json, 'remaining'), false);
});

test('legacy workflows without authentication retain Direct credentials and service', async () => {
  const legacy = { resource: 'software', operation: 'search', query: 'SpeechBrain', pageSize: 1, offset: 0 };
  const mapped = NodeHelpers.getNodeParameters(nodeType.description.properties, legacy, true, false, { typeVersion: 1 }, nodeType.description);
  assert.equal(mapped.authentication, 'direct');
  const h = setup(mapped);
  await h.run();
  assert.deepEqual(h.credentialReads, ['curatedFindsApi']);
  assert.equal(h.calls[0].options.baseURL, 'https://www.myworkingmemory.ai/api/software-library/direct');
});

test('RapidAPI auth is separate, secret-free by default and fixed to this product host', () => {
  assert.equal(rapidCredential.properties.find(p => p.name === 'apiKey').typeOptions.password, true);
  assert.equal(rapidCredential.properties.find(p => p.name === 'apiKey').default, '');
  assert.deepEqual(rapidCredential.authenticate.properties.headers, {
    'X-RapidAPI-Key': '={{$credentials.apiKey}}',
    'X-RapidAPI-Host': 'software-library-search.p.rapidapi.com',
  });
  assert.equal(rapidCredential.test.request.baseURL, 'https://software-library-search.p.rapidapi.com');
  assert.deepEqual(rapidCredential.test.request.qs, { query: 'SpeechBrain', limit: 1, offset: 0 });
  assert.equal(rapidCredential.test.request.disableFollowRedirect, true);
});

test('RapidAPI response shape, final pages, empty results and errors remain explicit', async () => {
  for (const output of ['raw', 'simplified', 'selected']) {
    const h = setup({ authentication: 'rapidapi', output }, { version: 'fixture-v1', total: 1, records: page().records });
    const [{ json }] = await h.run();
    assert.equal(json.nextOffset, null);
    assert.equal(Object.hasOwn(json, 'remaining'), false);
    for (const key of ['id', 'sourceURL', 'reviewedAt', 'evidenceLimits']) assert.deepEqual(json.records[0][key], page().records[0][key]);
  }
  const h = setup({ authentication: 'rapidapi' }, { version: 'fixture-v1', total: 0, records: [] });
  assert.equal((await h.run())[0].json.nextOffset, null);
  for (const response of [{ error: 'unauthorized' }, { version: 'fixture-v1', total: -1, records: [] }]) {
    await assert.rejects(setup({ authentication: 'rapidapi' }, response).run(), /unexpected response/);
  }
  await assert.rejects(setup({ authentication: 'https://untrusted.example' }).run());
});
