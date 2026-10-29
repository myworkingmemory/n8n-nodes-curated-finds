# Validation and release record

## October29 — prepared 0.3.0 Apify route

- Added one dedicated Apify credential and a third connection, preserving Direct defaults and RapidAPI behavior.
- Apify uses one bounded synchronous POST to the fixed existing Actor and returns its OUTPUT envelope; the credential test is a read-only GET /v2/users/me, which starts no Actor.
- Existing public Actor metadata confirms build0.0.11, 256MB,30s default runtime, $0.01 cap, no restart, paid-page event price $0.00599 and a separate fixed preview.
- All22 native offline tests, CLI lint and build pass; this includes legacy routes, credential selection, fixed URL/Actor, spend/input bounds, preview labeling, output evidence and errors without retries.
- A successful earlier preview run exists through the separate MCP-based n8n workflow; an existing one-result search is also visible in Apify Console. Neither establishes live execution through this new native connection.
- An authorized live search through the compiled native0.3.0 connection succeeded on October29: preview false, query SpeechBrain, limit1, $0.01 run cap,256MB,30s runtime, no restart. The returned OUTPUT contains one match, catalogue version, source/evidence fields and nextOffset:null. Apify credential authentication succeeded through read-only /v2/users/me and is restricted to api.apify.com in the private local demo.
- Official local source and packed-artifact scans both passed for0.3.0. The AI-agent example, genuine uncut recording, npm publication/provenance and Creator-version alignment remain separate verification steps at this preparation point.


## October 29, 2026 — version 0.2.0 RapidAPI support

The signed-in RapidAPI provider dashboard confirms the existing public **Software Library Search** product (Curated Finds), ID `api_3c54d1a7-96c5-4496-a450-94d76b37a548`. Its customer playground shows `GET https://software-library-search.p.rapidapi.com/search` with `X-RapidAPI-Key` and `X-RapidAPI-Host`. The API's search response contains `version`, `total`, and `records`; the node derives the next offset but never invents remaining RapidAPI quota.

- Added a separate RapidAPI credential and a Connection selector. Existing workflows without the selector retain Direct through n8n's native defaults.
- Official CLI lint and build pass; all **17 offline tests** pass. Tests now exercise native credential selection and node-owned base URL resolution as well as request routing, output, errors, legacy defaults and package loading.
- Official source and packed-artifact scanner both pass for 0.2.0.
- Added an inactive, credential-free RapidAPI example. Existing Direct example remains available.
- No live API calls, browser credential tests or completed AI-agent executions are claimed by these checks.
- 0.1.2 is public with valid provenance and passed n8n automated review; the Creator portal requires an uncut video before manual review. That pass does not apply automatically to 0.2.0. Release 0.2.0 and its published-package/provenance scan are pending at this preparation step.
- The package-specific npm trusted publisher is valid for `myworkingmemory/n8n-nodes-curated-finds`, `publish.yml`; temporary npm tokens and the old GitHub secret were removed. Future releases use the authorized OIDC workflow.

Historical preparation notes below describe earlier versions; the current status above supersedes their pending-publication instructions.


Prepared October 28, 2026. This package is a native integration for the existing **Curated Finds Direct** service, not a generic Apify wrapper. No website server, existing workflow, account, credential or subscription was changed during package construction.

## Completed checks

- Official `npm create @n8n/node@0.54.1` scaffold, declarative/custom HTTP template; it resolved `@n8n/node-cli` 0.55.1, now pinned in this package.
- Official CLI `npm run lint` and `npm run build` pass.
- Thirteen offline semantic tests pass using `n8n-core` 2.45.4 and `n8n-workflow` 2.45.2, the published dependencies of n8n 2.45.5. The actual n8n package loader registers the node and credentials. Tests exercise native parameter/expression mapping, `RoutingNode.makeRequest`, hooks and output conversion with a mocked HTTP transport. They cover one-page mapping, empty results, no automatic next-page request, invalid inputs before transport, propagated failures, malformed response handling, secret-free defaults, the sample workflow, declared credential test, enforced search timeout and all three output modes.
- `npm run scan:local` runs the official `@n8n/scan-community-package` 0.41.1 static analyzer on source and the exact local npm tarball. Both source and packed artifact passed. Its result is saved in the ignored `.validation/scan-local.json`. This is local static analysis; it does not check an npm provenance attestation or a public GitHub repository.
- The npm allowlist contains compiled nodes/credentials, safe example JSON, README, LICENSE and this file. It excludes tests, local account data, `node_modules`, build-cache files and operator evidence.

No live API search, credential test, direct subscription lookup, model-provider request or payment was made. No hosted editor import, browser credential form or full `RoutingNode.runNode` execution is claimed by these tests. The initial package-construction phase created no npm package, GitHub repository, tag or n8n verification application; subsequent source-publication status is recorded below. An actual product run requires the customer's direct subscription key and uses their allowance.

The local shell was Node.js 22.14.0. Build/lint/tests run successfully there, but current release tooling requires a newer supported runtime. CI and publishing use Node.js 24; use current Node 24 LTS for a fresh development installation. Local installation used `npm install --ignore-scripts` because product runtime tests do not need optional native development dependencies; the clean GitHub CI run remains a separate acceptance check.

## Branding validation — October 29, 2026

The visible node and credential names now include Myworkingmemory, and the node codex includes company, product and software-search aliases. The example's node label and connection references were updated together; internal node/credential identifiers, package version 0.1.0 and API behaviour are unchanged.

- `npm run check` passed: official CLI lint/build and all 13 existing offline tests. No new tests were added.
- `npm run scan:local` passed for both source and the packed 0.1.0 artifact. This remains local static analysis, without registry provenance or public-repository verification.
- A read-only reference check confirmed that every connection in the renamed example resolves to an existing node; `git diff --check` passed.
- No live API request, credential test, browser execution, paid lookup, commit, push or publication was performed for this change.

## Runtime boundaries found during review

n8n 2.45.5's routing engine overwrites `requestDefaults.timeout` before sending. Search therefore enforces 30 seconds in its final pre-send hook, with a regression test. The native credential-test service constructs its own routing node, so its timing is controlled by n8n and can reach five minutes in this version despite the request's declared 30 seconds. Both use a fixed HTTPS destination, no redirects and a 1 MiB decoded-response limit.

The package itself does not retry or page automatically. n8n's authentication helper can retry a rejected authentication request once. Rejected credentials do not pass the direct service's lookup admission. One successful credential test uses one included lookup; n8n can invoke a new test when saving or retesting credentials. This is prominently disclosed in the credential form, README and example. The test is a real fixed search (`query=n8n`, `limit=1`, `offset=0`), not a format-only check or simulated success.

Every workflow input item and every later AI-tool invocation can use another lookup. The example sets Execute Once and disables Retry On Fail. The direct plan is hard capped at 1,000 lookups per paid period, shared with the website reader; valid empty results count. Search results preserve catalogue version, total, next offset and remaining allowance. Simplified and selected output modes retain original source/review/evidence fields.

## Publication status — October 29, 2026

Version 0.1.0 was published from tag `0.1.0` at commit `4cbabd683e702ea814b698ff5d897b12a4f53198` by [GitHub Actions run 40905548930](https://github.com/myworkingmemory/n8n-nodes-curated-finds/actions/runs/40905548930). npm accepted the package and the workflow reported signed provenance with transparency-log index `3570854679`. Public availability was subsequently confirmed with `npm view` and the npm package website, with provenance present. At that stage the official published-package scanner had not yet run; n8n verification and Cloud availability are not claimed.

Version 0.1.1 corrected the README's initial unpublished-package wording. Only documentation and package-version metadata changed; node and credential behaviour were unchanged. The documentation-only diff and package/lockfile version consistency were checked without repeating local runtime tests. Release CI ran the existing validation. The package was published by [GitHub Actions run 40906748791](https://github.com/myworkingmemory/n8n-nodes-curated-finds/actions/runs/40906748791) from tag `0.1.1` at commit `5fc9ae08a01eed894cc3a4f67e6ac1f0b0db5513`.

The official command `npx @n8n/scan-community-package@0.41.1 n8n-nodes-curated-finds@0.1.1` completed on October 29, 2026 at 16:02:57 UTC, printed that the package passed all security checks and exited 0. It passed the provenance check, fetched the attested public source and analyzed the published package. The public npm attestation independently matched repository `myworkingmemory/n8n-nodes-curated-finds`, workflow `.github/workflows/publish.yml`, tag `0.1.1` and the full commit above. This result does not imply a live product API test or n8n approval.

Version 0.1.2 corrects the package author and README support contact to the user-confirmed address `dean@myworkingmemory.ai`. It changes only contact documentation, release records and package-version metadata. The diff and package/lockfile consistency were checked; the unchanged 13-test suite was not repeated locally. Release CI remains configured to run lint, build, those tests and local scans. Publication and the official published-package scan of 0.1.2 remain pending at preparation.

## External publication follow-through

1. The public source repository exists at https://github.com/myworkingmemory/n8n-nodes-curated-finds. Its initial commit passed GitHub CI: https://github.com/myworkingmemory/n8n-nodes-curated-finds/actions/runs/40778848901. Push each reviewed release change and verify CI before tagging.
2. Complete the contact-only 0.1.2 release using the authorized publication flow, then revoke temporary npm access and remove the repository Actions secret after verified publication. npm trusted publishing requires an existing package; configure it near the next legitimate release using owner `myworkingmemory`, repository `n8n-nodes-curated-finds`, workflow `publish.yml` and the intended direct-publish permission.
3. Publish only via the tag-triggered GitHub Action. Since May 1, 2026, n8n verification requires GitHub Actions npm provenance and a reachable public source repository. Do not claim provenance before that action has produced an attestation. Do not push a release tag until npm access is ready.
4. Run `npx @n8n/scan-community-package@0.41.1 n8n-nodes-curated-finds@0.1.2` on the published package, checking its printed verdict as well as process status. The CLI can print a failed verdict yet exit zero. The earlier `--help` attempt was interpreted as a registry package name and returned 404, so it was not a package scan.
5. Submit the package at the n8n Creator Portal Nodes section. Publication is not verification; n8n makes the final approval decision. The service supplies one clearly scoped action and public docs, with no runtime dependencies beyond the allowed n8n peer.

## Sources

- Existing service contract: https://www.myworkingmemory.ai/curated-finds-docs.html
- Existing subscription and key delivery: https://www.myworkingmemory.ai/apis
- Official CLI: https://docs.n8n.io/connect/create-nodes/build-your-node/using-the-n8n-node-tool
- Verification: https://docs.n8n.io/connect/create-nodes/build-your-node/reference/verification-guidelines
- Publishing and provenance: https://docs.n8n.io/connect/create-nodes/deploy-your-node/submit-community-nodes
- AI output modes: https://docs.n8n.io/connect/create-nodes/build-your-node/reference/ux-guidelines#ai-tool-nodes-output-parameter
- Native credential-test behaviour: https://github.com/n8n-io/n8n/blob/n8n%402.45.5/packages/cli/src/services/credentials-tester.service.ts
