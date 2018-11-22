import pg from "pg";
import SQLWrapper from "./SQLWrapper";

export type query_values = Array<any>;

export default class SQLConnection {
	private _c: pg.Client;
	private _pool: SQLWrapper;
	private transaction_started: boolean;
	private released: boolean;

	constructor(connection: pg.Client, pool: SQLWrapper) {
		this._c = connection;
		this._pool = pool;
		this.released = false;
		this.transaction_started = false;
	}

	/**
	 *
	 * @param sql    {string}
	 * @param values {Array<*>=}
	 * @returns {Promise<Object>}
	 */
	async query(sql: string, values?: query_values): Promise<pg.Result> {
		if(!this.released)
			return await this._c.query(sql,values);
	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	async beginTrans() {
		this.transaction_started = true;
		await this.query('BEGIN');
	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	async commitTrans() {
		if(this.transaction_started) {
			await this.query('COMMIT');
			this.transaction_started = false;
		}
	}

	async rollbackTrans(): Promise<void> {
		if(this.transaction_started) {
			await this.query('ROLLBACK');
			this.transaction_started = false;
		}
	}

	isReleased(): boolean {
		return this.released;
	}

	release() {
		if(!this.released) {
			this.released = true;
			this._c.release();
		}
	}
}