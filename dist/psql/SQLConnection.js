export default class SQLConnection {
    constructor(connection, pool) {
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
    async query(sql, values) {
        if (!this.released)
            return await this._c.query(sql, values);
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
        if (this.transaction_started) {
            await this.query('COMMIT');
            this.transaction_started = false;
        }
    }
    async rollbackTrans() {
        if (this.transaction_started) {
            await this.query('ROLLBACK');
            this.transaction_started = false;
        }
    }
    isReleased() {
        return this.released;
    }
    release() {
        if (!this.released) {
            this.released = true;
            this._c.release();
        }
    }
}
