# Myworkingmemory Curated Finds for n8n

Search [Curated Finds](https://www.myworkingmemory.ai/curated-finds-docs.html), Myworkingmemory's source-reviewed catalogue of software and models, from an n8n workflow or AI agent. Results include source links, setup requirements, license declarations, evidence limits and original review dates.

This package integrates the existing **Curated Finds Direct API**. An Apify, MCPize, RapidAPI or API.market subscription does not provide a direct API key. [n8n](https://n8n.io/) is a workflow automation platform.

## Installation

Self-hosted users can install [`n8n-nodes-curated-finds`](https://www.npmjs.com/package/n8n-nodes-curated-finds) under **Settings → Community Nodes**, following [n8n's installation guide](https://docs.n8n.io/integrations/community-nodes/installation/). This package is not yet verified by n8n. n8n Cloud installation requires separate n8n verification. Do not treat a public GitHub repository or npm package as evidence of Cloud availability.

After installation, search the node picker for **Myworkingmemory**, **My Working Memory**, **Curated Finds** or **software search**, then select **Myworkingmemory Curated Finds**. The npm package name remains `n8n-nodes-curated-finds`.

For local development, see [Compatibility and development](#compatibility-and-development).

## Credentials and lookup use

1. Open [Myworkingmemory APIs](https://www.myworkingmemory.ai/apis), subscribe to Curated Finds Direct, or sign in to an existing subscription.
2. Select **Show API key**, then copy your `cf_…` key into an n8n **Myworkingmemory Curated Finds API** credential. n8n encrypts credentials at rest; never put this key in a workflow parameter or example JSON.
3. Select that credential on the Myworkingmemory Curated Finds node.

**Saving or testing this credential in n8n can run a real search and uses one included lookup per test.** The test is fixed to `query=n8n`, `limit=1`, `offset=0`; an empty result still uses one lookup. n8n shows this notice in the credential form. A successful test confirms actual authenticated access, not only key format. The node does not perform a separate startup search when a workflow runs.

The current direct plan is **$5.99 USD/month for 1,000 lookups**, shared between the website reader and direct API. Each accepted search page, including a valid empty page, uses one lookup and returns up to 25 records. The allowance is hard capped; it does not automatically buy more calls. n8n hosting and model-provider costs are separate. The [current offer and terms](https://www.myworkingmemory.ai/curated-finds-docs.html#pricing) govern.

A cancelled, failed-delivery or timed-out request may already have used a lookup. Keep **Retry On Fail** off, inspect your account before retrying, and request later pages explicitly. Each input item causes one search request; use n8n's **Execute Once** setting when your workflow should make only one search.

## Operation

**Software → Search** calls:

```text
GET https://www.myworkingmemory.ai/api/software-library/direct/search
Authorization: Bearer <your encrypted credential>
```

| Field | Behaviour |
| --- | --- |
| Query | Optional text, maximum 200 characters; blank lists matching records. |
| Page Size | API `limit`, integer 1–25; default 10. |
| Category | Optional existing filter value, maximum 100 characters. |
| Platform | Optional existing filter value, maximum 100 characters. |
| Offset | Integer 0–10,000; default 0. For another page, explicitly use the previous `nextOffset`. |

The node returns **one page envelope per input item**, preserving `version`, `total`, `records`, `nextOffset` and `remaining`. The Output option defaults to Raw (all record fields); Simplified returns ten useful fields; Selected Fields includes your choices plus ID, source URL, original review date and evidence limits. Every mode preserves the page and allowance envelope. It does not split records automatically, discard empty pages or invent a coverage guarantee. Use n8n's Split Out node on `records` only after saving any page and allowance information you need. Compare `version` between pages. Source review does not prove installation, runtime compatibility, accessibility fit or freshness beyond the record's stated review date.

There is no automatic pagination or node-level retry. Requests go only to the fixed HTTPS service origin, refuse redirects and cap decoded responses at 1 MiB. Workflow searches enforce a 30-second timeout. n8n 2.45.5 controls native credential-test timing and may wait up to five minutes. Its authentication helper can retry a rejected authentication request once; rejected credentials do not use the service lookup allowance. Authentication, allowance and service failures remain errors. Each subsequent page and each new AI-tool invocation is another lookup.

The direct API currently provides search only. This node does not invent record-by-ID, catalogue-info, date filtering, installation or software-execution operations.

## Example workflow

Import [`examples/search-software.json`](examples/search-software.json) after installing the package. It contains:

**Manual Trigger → Myworkingmemory Curated Finds → Review page and remaining allowance**

The example has no credentials, saved data, active schedule or automatic retry. Add your own credential. Search uses `SpeechBrain`, page size 3 and offset 0; executing it uses one lookup, in addition to any credential test. The last node preserves the full response for inspection.

For an AI agent, add Myworkingmemory Curated Finds as a tool, select your own credential, and set a small fixed page size. The node advertises `usableAsTool: true`; the agent's repeated tool calls are separate lookups, so configure the agent's iteration limits and approval behaviour for your workflow. This package never supplies the publisher's credentials.

## Compatibility and development

Generated with the official `npm create @n8n/node` declarative HTTP template. Source checks use `@n8n/node-cli` 0.55.1. Mocked integration tests use the exact core/workflow package versions from n8n 2.45.5 (`n8n-core` 2.45.4 and `n8n-workflow` 2.45.2). This is a compatibility target, not a claim that every n8n release or an AI-model execution has been tested.

Use a current Node.js 24 LTS version for the development/release toolchain, then:

```sh
npm ci
npm run check
npm run dev
```

`npm run dev` starts an isolated local n8n development instance. Do not attach a real product credential unless you intend to spend its lookup allowance. Tests use the actual n8n routing and expression engine with mocked HTTP transport and make no paid API calls. They do not exercise the browser credential form or a real model invocation. See [VALIDATION.md](VALIDATION.md) for the exact completed checks and publication prerequisites.

## Publishing and support

The MIT-licensed source is available at [myworkingmemory/n8n-nodes-curated-finds](https://github.com/myworkingmemory/n8n-nodes-curated-finds), and the package is published on [npm](https://www.npmjs.com/package/n8n-nodes-curated-finds). Releases use the tag-triggered `.github/workflows/publish.yml` GitHub Action with npm provenance. Maintainers must ensure authorized npm publication access is configured before pushing a release tag. n8n Cloud verification remains separate from npm publication.

Product documentation: [Curated Finds API](https://www.myworkingmemory.ai/curated-finds-docs.html). Support: [Myworkingmemory support](https://www.myworkingmemory.ai/software-library-support.html). License: [MIT](LICENSE).
