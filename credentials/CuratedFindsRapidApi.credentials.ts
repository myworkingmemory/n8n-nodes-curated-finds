import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class CuratedFindsRapidApi implements ICredentialType {
	name = 'curatedFindsRapidApi';
	displayName = 'Myworkingmemory Curated Finds (RapidAPI) API';
	icon = { light: 'file:../nodes/CuratedFinds/curatedFinds.svg', dark: 'file:../nodes/CuratedFinds/curatedFinds.dark.svg' } as const;
	documentationUrl = 'https://rapidapi.com/Myworkingmemory/api/software-library-search';
	properties: INodeProperties[] = [
		{
			displayName: 'RapidAPI Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'The X-RapidAPI-Key from your subscribed Software Library Search application in the RapidAPI playground',
		},
		{
			displayName: 'Saving or testing this credential sends one real search request through RapidAPI. It counts toward your plan allowance and may incur charges under your plan. A free plan with one request leaves no further request for the workflow after a successful test.',
			name: 'testNotice',
			type: 'notice',
			default: '',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-RapidAPI-Key': '={{$credentials.apiKey}}',
				'X-RapidAPI-Host': 'software-library-search.p.rapidapi.com',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://software-library-search.p.rapidapi.com',
			url: '/search',
			method: 'GET',
			headers: { Accept: 'application/json' },
			qs: { query: 'SpeechBrain', limit: 1, offset: 0 },
			timeout: 30000,
			disableFollowRedirect: true,
			maxRedirects: 0,
			maxResponseBodyBytes: 1048576,
		},
	};
}
