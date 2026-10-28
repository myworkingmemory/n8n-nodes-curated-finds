import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class CuratedFindsApi implements ICredentialType {
	name = 'curatedFindsApi';

	displayName = 'Curated Finds API';

	icon = { light: 'file:../nodes/CuratedFinds/curatedFinds.svg', dark: 'file:../nodes/CuratedFinds/curatedFinds.dark.svg' } as const;

	documentationUrl = 'https://www.myworkingmemory.ai/curated-finds-docs.html#api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Your direct Curated Finds subscription key, starting with cf_. Marketplace keys are separate.',
		},
		{
			displayName: 'Saving or testing this credential can run one real search and use one included subscription lookup per test, even with no matches. The test searches n8n with a page size of 1. The plan has a hard allowance cap.',
			name: 'testNotice',
			type: 'notice',
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: { Authorization: '=Bearer {{$credentials.apiKey}}' },
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.myworkingmemory.ai/api/software-library/direct',
			url: '/search',
			method: 'GET',
			headers: { Accept: 'application/json' },
			qs: { query: 'n8n', limit: 1, offset: 0 },
			timeout: 30000,
			disableFollowRedirect: true,
			maxRedirects: 0,
			maxResponseBodyBytes: 1048576,
		},
	};
}
