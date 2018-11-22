import SQLWrapper, { con_config } from "./SQLWrapper";
import { merge, clone } from "lodash";
import SQLConnection from "./SQLConnection";

export type options = {
	create_default?: boolean,
	default_conn?: con_config
};

export type connection_container = {
	c: SQLWrapper,
	config: con_config
}

const default_options = {
	create_default: true,
	default_conn: {}
};

export default class SQLPool {
	private connections: Map<string, connection_container>;
	private common_connection: con_config;

	private options: options; 

	constructor(common_connection: con_config, opts: options) {
		this.connections = new Map();
		this.common_connection = clone(common_connection);
		this.options = merge({}, default_options, opts);

		if(this.options.create_default)
			this.createPool(this.options.default_conn, 'default');
	}

	createPool(opts: con_config, name: string = 'default'): SQLWrapper {
		if(this.connections.has(name)) {
			throw new Error("pool already exists");
		}

		let config = merge({},this.common_connection,opts);

		let conn = {
			c: new SQLWrapper(name, config),
			config,
		};

		this.connections.set(name, conn);

		return conn.c
	}

	hasPool(name: string): boolean {
		return this.connections.has(name);
	}

	/**
	 *
	 * @param name {string}
	 * @returns {SQLWrapper|null}
	 */
	getPool(name = 'default'): SQLWrapper|null {
		let conn = this.connections.get(name);

		if(conn) {
			this.connections.set(name,conn);
			return conn.c;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @param name {string=}
	 * @returns {Promise<SQLConnection>}
	 */
	async connect(name: string): Promise<SQLConnection> {
		let pool = this.getPool(name);

		if(pool !== null) {
			return await pool.connect();
		} else {
			return null;
		}
	}

	setCommonConnection(common) {
		this.common_connection = clone(common);
	}

	setDefaultOptions(options) {
		this.options = merge({},this.options,options);
	}
}