# Myworkingmemory Curated Finds for n8n

Search Myworkingmemory's **Software Library Search / Curated Finds** catalogue from an n8n workflow or AI agent. Results contain source links, descriptions, setup requirements, license declarations, evidence limits and original review dates.

Use your existing **[RapidAPI subscription](https://rapidapi.com/Myworkingmemory/api/software-library-search)** or **[Curated Finds Direct subscription](https://www.myworkingmemory.ai/apis/curated-finds)**. They are separate billing routes for the same catalogue; their keys are not interchangeable. Apify has a separate connection in version 0.3.0; use an Apify API token for it. MCPize and API.market keys do not work with these connections.


## Apify connection — 0.3.0

Version 0.3.0 adds **Connection: Apify** for the existing [Myworkingmemory Software Library Search Actor](https://apify.com/myworkingmemory/software-library-search). The connection is checked offline; the validation record identifies the live verification scope.

1. Select **Apify** and create a **Myworkingmemory Curated Finds (Apify) API** credential with your existing Apify API token; restrict credential HTTP access to `api.apify.com`.
2. Saving, reopening or testing that credential sends only `GET https://api.apify.com/v2/users/me`. It starts no Actor and buys no search page; it also does not establish paid-search eligibility.
3. Set a finite **Maximum Run Charge (USD)**, default **$0.01** (allowed $0.01–$1). The node sends one authenticated `POST` to `https://api.apify.com/v2/acts/ghlTCYxrSCV2k1UzV/run-sync`, with `timeout=30`, `memory=256`, `restartOnError=false`, `maxTotalChargeUsd` and `outputRecordKey=OUTPUT`.
4. For the fixed sample, enable **Fixed Preview**, set **Page Size 3**, leave Query/Category/Platform blank and Offset 0. The same three sample records return each time; this is not a keyword search and has no catalog-search event charge, though platform/storage costs can apply.
5. For a full search, leave Fixed Preview off and supply the normal filters. The current Actor charges **$0.00599 per completed search page**, including an empty page, and requires an eligible paid Apify account. Your Apify account, credit and charges are separate from RapidAPI and Direct; the node never buys a plan.

Each input item or AI tool invocation starts a separate Actor run with its own cap. Keep Retry On Fail off. The HTTP timeout is 60 seconds while the Actor runtime is capped at 30 seconds; startup can also take time. A disconnected/timed-out request may have started a billable run: inspect Apify Runs before trying again. The node makes no automatic retry, paging or second request to recover a run. The Actor's OUTPUT retains catalogue version, total, preview/search mode and evidence; nextOffset is derived from the returned page, and remaining account quota is never invented.

The credential-free [Apify preview example](examples/search-software-apify.json) is inactive and starts nothing until manually executed with your credential.

## Installation

Self-hosted users can install [`n8n-nodes-curated-finds`](https://www.npmjs.com/package/n8n-nodes-curated-finds) under **Settings → Community Nodes**, following [n8n's installation guide](https://docs.n8n.io/integrations/community-nodes/installation/). Search the node picker for **Myworkingmemory**, **Curated Finds**, **Software Library Search** or **RapidAPI**, then select **Myworkingmemory Curated Finds**.

This package is not yet verified by n8n. n8n Cloud installation requires separate verification; npm publication does not establish Cloud availability.

## Connect RapidAPI

1. Open [Software Library Search on RapidAPI](https://rapidapi.com/Myworkingmemory/api/software-library-search) and use an application with access to that API.
2. In the n8n node, select **Connection → RapidAPI**.
3. Create a **Myworkingmemory Curated Finds (RapidAPI) API** credential. Paste that application's `X-RapidAPI-Key` from the [RapidAPI playground](https://rapidapi.com/Myworkingmemory/api/software-library-search/playground/searchSoftware).
4. Select the saved credential. Your key is encrypted in n8n, never placed in workflow parameters or example JSON.

**Saving or testing this credential sends one real search request** (`query=SpeechBrain`, `limit=1`, `offset=0`). It counts toward the selected plan and may incur its charges. A free plan with one request can be consumed by this credential test, leaving no workflow request. Check [current RapidAPI pricing](https://rapidapi.com/Myworkingmemory/api/software-library-search/pricing), quota and bandwidth terms before running. The node does not buy or change a plan.

Requests use only:

```text
GET https://software-library-search.p.rapidapi.com/search
X-RapidAPI-Host: software-library-search.p.rapidapi.com
X-RapidAPI-Key: <your encrypted RapidAPI credential>
```

## Connect Direct

1. Open [Curated Finds Direct](https://www.myworkingmemory.ai/apis/curated-finds) and sign in to your subscription, or review the subscription there.
2. Select **Show API key** and copy your `cf_…` key into a **Myworkingmemory Curated Finds API** credential.
3. Select **Connection → Direct** and that credential.

Direct remains the default to preserve existing workflows from versions 0.1.x. **Saving or testing a Direct credential uses one included lookup**, fixed to `query=n8n`, `limit=1`, `offset=0`, even with no matches. Direct currently costs $5.99/month for 1,000 lookups shared with the website reader, with a hard allowance cap. See the [current offer and terms](https://www.myworkingmemory.ai/curated-finds-docs.html#pricing).

```text
GET https://www.myworkingmemory.ai/api/software-library/direct/search
Authorization: Bearer <your encrypted Direct credential>
```

## Search and output

**Software → Search** sends one request per input item. Use **Execute Once** if your workflow should make only one request. n8n hosting and AI-model costs are separate.

| Field | Behaviour |
| --- | --- |
| Query | Optional text, maximum 200 characters; blank lists matching records. |
| Page Size | Integer 1–25; default 10. |
| Category | Optional existing filter value, maximum 100 characters. |
| Platform | Optional existing filter value, maximum 100 characters. |
| Offset | Integer 0–10,000; default 0. Use `nextOffset` explicitly to request another page. |

Each input returns one page with `version`, `total`, `records` and `nextOffset`. **RapidAPI's nextOffset is calculated from the requested offset and returned record count; its JSON does not report remaining plan quota.** Direct additionally returns `remaining`. No RapidAPI quota is invented.

Output defaults to **Raw** (all record fields). **Simplified** returns ten useful fields. **Selected Fields** returns chosen fields plus ID, source URL, original review date and evidence limits. All modes retain the page envelope. Use n8n's Split Out node on `records` only after retaining page information you need. Compare catalogue `version` between pages.

The node supports one-page search through all three connections. It does not run or install the catalogue's tools, provide date filters, or implement the other RapidAPI endpoints. Source review does not prove runtime compatibility, accessibility fit or freshness beyond each record's review date.

## Request limits

There is no automatic pagination or node-level retry. Each request goes to the selected fixed HTTPS host, refuses redirects and caps decoded responses at 1 MiB. Direct and RapidAPI workflow searches enforce 30 seconds; the Apify HTTP request enforces 60 seconds and its Actor runtime is capped at 30 seconds. n8n 2.45.5 controls credential-test timing and may wait up to five minutes; its authentication helper may retry a rejected authentication request once. Plan rules determine whether failed requests count. Keep **Retry On Fail** off and inspect usage before retrying a timeout, since the request may already have been processed.

Authentication, allowance and service failures remain errors. A successful empty page still uses a request. Every later page and every new AI-tool invocation is another request.

## Examples and AI tools

- [RapidAPI workflow](examples/search-software-rapidapi.json): Manual Trigger → Myworkingmemory Curated Finds → Review catalogue page.
- [Direct workflow](examples/search-software.json): preserves the original Direct connection and allowance output.

Both examples are inactive, credential-free and have no saved execution data or retries. They search `SpeechBrain`, page size 3, offset 0. Each execution sends one request in addition to any credential test.

For an AI agent, add **Myworkingmemory Curated Finds** as a tool, choose the correct connection and your credential, and set a small fixed page size. `usableAsTool: true` is enabled. Configure agent iteration limits: repeated tool invocations consume separate requests. The publisher's credentials are never provided to customers.

## Compatibility and development

Built with the official n8n declarative node CLI 0.55.1. Offline tests use n8n-core 2.45.4 and n8n-workflow 2.45.2 from n8n 2.45.5, exercising the native loader, parameter mapping, credential selection, routing and hooks with mocked HTTP. This does not claim a live API request, browser credential test or AI-model execution. See [VALIDATION.md](VALIDATION.md).

Use Node.js 24 LTS:

```sh
npm ci
npm run check
npm run scan:local
npm run dev
```

## Publishing and support

Source: [myworkingmemory/n8n-nodes-curated-finds](https://github.com/myworkingmemory/n8n-nodes-curated-finds). Releases use the tag-triggered `.github/workflows/publish.yml` GitHub Action with npm provenance and the authorized package-specific trusted publisher. Verification by n8n is a separate step.

Documentation: [Curated Finds API](https://www.myworkingmemory.ai/curated-finds-docs.html). Support: [dean@myworkingmemory.ai](mailto:dean@myworkingmemory.ai) or [Myworkingmemory support](https://www.myworkingmemory.ai/software-library-support.html). License: [MIT](LICENSE).
