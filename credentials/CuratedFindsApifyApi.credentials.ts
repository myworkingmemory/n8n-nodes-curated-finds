import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class CuratedFindsApifyApi implements ICredentialType {
	name = 'curatedFindsApifyApi';
	displayName = 'Myworkingmemory Curated Finds (Apify) API';
	icon = { light: 'file:../nodes/CuratedFinds/curatedFinds.svg', dark: 'file:../nodes/CuratedFinds/curatedFinds.dark.svg' } as const;
	documentationUrl = 'https://apify.com/myworkingmemory/software-library-search';
	properties: INodeProperties[] = [
		{
			displayName: 'Apify API Token',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Your Apify API token; RapidAPI and Direct keys do not work here',
		},
		{
			displayName: 'Saving, reopening or testing this credential checks your Apify account with a read-only request. It does not start an Actor or buy a search page. A successful credential test does not establish paid-search eligibility.',
			name: 'testNotice',
			type: 'notice',
			default: '',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: { headers: { Authorization: '=Bearer {{$credentials.apiKey}}' } },
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.apify.com',
			url: '/v2/users/me',
			method: 'GET',
			headers: { Accept: 'application/json' },
			timeout: 30000,
			disableFollowRedirect: true,
			maxRedirects: 0,
			maxResponseBodyBytes: 1048576,
		},
	};
}
