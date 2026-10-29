# Changelog

## 0.3.0

- Add a dedicated Apify connection for Myworkingmemory Software Library Search, retaining Direct and RapidAPI defaults.
- Run one fixed Actor with an explicit spending cap, bounded runtime/memory, no restart and no automatic paging.
- Add fixed-preview support with blank filters, exactly three records and explicit preview labeling.
- Authenticate Apify credentials through a read-only account check that does not start an Actor.
- Preserve the Actor OUTPUT catalogue envelope and evidence fields without inventing remaining quota.

## 0.2.0

- Add a separate RapidAPI credential and connection for the existing Software Library Search product.
- Preserve Direct credentials and defaults for existing workflows.
- Handle RapidAPI page responses without inventing remaining quota; derive the next offset without another call.
- Add RapidAPI setup examples and native routing, credential-selection and compatibility tests.

## 0.1.2

- Correct the package author email to dean@myworkingmemory.ai and add the working support address to the README.
- Record the published 0.1.1 scanner pass and provenance; node behaviour is unchanged.

## 0.1.1

- Correct installation and publication documentation after the initial npm release.
- Record the 0.1.0 release and provenance status; node behaviour is unchanged.

## 0.1.0

- Add one-page search of Curated Finds Direct with encrypted customer credentials.
- Retain source evidence, catalogue version, paging and remaining allowance.
- Bound request inputs, response size and time; refuse redirects; no automatic paging or node-level retries.
- Explain the single lookup used by each credential test.
- Include an inactive, credential-free example and mocked native-routing tests.
