import pg from "pg";

import SQLConnection from "./SQLConnection";

const to_object_defaults = {
	array_keys: [],
	id_field: 'id',
	field_separator: '__'
};

export type pool_con_config = {
	connectionTimeoutMillis?: number,
	idleTimeoutMillis?: number,
	max?: number
};

export type client_con_config = {
	user?: string,
	password?: string,
	database?: string,
	port?: number,
	connectionString?: string,
	ssl?: any,
	types?: any,
	statement_timeout?: number
}

export type con_config = pool_con_config & client_con_config

export default class SQLWrapper {
	private _c: pg.Pool;
	private _name: string;
	public closed: boolean;

	constructor(name: string, config: con_config) {
		this._c = new pg.Pool(config);
		this.closed = false;
	}

	async connect(): Promise<SQLConnection> {
		return new SQLConnection(await this._c.connect(), this);
	}

	async end(): Promise<void> {
		await this._c.end();
		this.closed = true;
	}
}