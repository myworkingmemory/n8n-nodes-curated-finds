import {
	NodeOperationError,
	type IExecuteSingleFunctions,
	type IDataObject,
	type IHttpRequestOptions,
	type INodeExecutionData,
} from 'n8n-workflow';

const preservedFields = ['id', 'sourceURL', 'reviewedAt', 'evidenceLimits'];
const selectableFields = ['category', 'getSoftwareURL', 'licenseDeclaration', 'licenseURL', 'name', 'platforms', 'purpose', 'requirements', 'type'];
const simplifiedFields = ['id', 'name', 'purpose', 'type', 'sourceURL', 'getSoftwareURL', 'requirements', 'licenseDeclaration', 'reviewedAt', 'evidenceLimits'];

/** Validate expressions as well as UI values before any metered request. */
export async function validateSearchRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const connection = this.getNodeParameter('authentication', 'direct');
	if (connection !== 'direct' && connection !== 'rapidapi') {
		throw new NodeOperationError(this.getNode(), 'Select Direct or RapidAPI for the connection');
	}
	// Select one fixed service destination; never accept a user-supplied host.
	requestOptions.baseURL = connection === 'rapidapi'
		? 'https://software-library-search.p.rapidapi.com'
		: 'https://www.myworkingmemory.ai/api/software-library/direct';
	requestOptions.url = '/search';
	const qs = requestOptions.qs ?? {};
	for (const [name, maximum] of [['query', 200], ['category', 100], ['platform', 100]] as const) {
		if (typeof qs[name] !== 'string' || (qs[name] as string).length > maximum) {
			throw new NodeOperationError(this.getNode(), `${name} must be text of at most ${maximum} characters`);
		}
	}
	for (const [name, minimum, maximum] of [['limit', 1, 25], ['offset', 0, 10000]] as const) {
		const value = qs[name];
		const numeric = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
		if (typeof numeric !== 'number' || !Number.isSafeInteger(numeric) || numeric < minimum || numeric > maximum) {
			throw new NodeOperationError(this.getNode(), `${name} must be an integer from ${minimum} to ${maximum}`);
		}
		qs[name] = numeric;
	}
	const output = this.getNodeParameter('output');
	const fields = this.getNodeParameter('fields', []);
	if (!['raw', 'simplified', 'selected'].includes(output as string) ||
		(output === 'selected' && (!Array.isArray(fields) || fields.some(field => !selectableFields.includes(field as string))))) {
		throw new NodeOperationError(this.getNode(), 'Select a valid output mode and record fields');
	}
	// RoutingNode.runNode applies its global timeout after requestDefaults.
	// The pre-send hook runs later, so enforce the bound at the final request.
	requestOptions.timeout = 30000;
	return requestOptions;
}

/** Keep the page and usage envelope; never turn an API error into an empty shortlist. */
export async function validateSearchResponse(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const result = items.length === 1 ? items[0].json : undefined;
	const limit = this.getNodeParameter('pageSize') as number;
	const rapidapi = this.getNodeParameter('authentication', 'direct') === 'rapidapi';
	if (!result || typeof result.version !== 'string' || !result.version ||
		!Array.isArray(result.records) || result.records.length > limit ||
		!Number.isSafeInteger(result.total) || (result.total as number) < result.records.length ||
		(!rapidapi && (!Number.isSafeInteger(result.remaining) || (result.remaining as number) < 0 ||
		!(result.nextOffset === null || (Number.isSafeInteger(result.nextOffset) && (result.nextOffset as number) > 0))))) {
		throw new NodeOperationError(this.getNode(), 'Curated Finds returned an unexpected response. The lookup may have been used; inspect your account before retrying.');
	}
	if (rapidapi) {
		const next = Number(this.getNodeParameter('offset')) + (result.records as IDataObject[]).length;
		// RapidAPI returns no quota or cursor in the JSON body. Derive only the
		// next position from this page; do not invent a remaining-plan allowance.
		result.nextOffset = (result.records as IDataObject[]).length > 0 && next < (result.total as number) ? next : null;
	}
	const output = this.getNodeParameter('output');
	if (output === 'raw') return items;
	const fields = output === 'simplified' ? simplifiedFields :
		[...new Set([...preservedFields, ...(this.getNodeParameter('fields') as string[])])];
	const records = (result.records as IDataObject[]).map(record => Object.fromEntries(
		fields.filter(field => Object.hasOwn(record, field)).map(field => [field, record[field]]),
	));
	return [{ ...items[0], json: { ...result, records } }];
}
