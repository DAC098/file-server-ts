import SQLWrapper from "./SQLWrapper";
import { merge, clone } from "lodash";
const default_options = {
    create_default: true,
    default_conn: {}
};
export default class SQLPool {
    constructor(common_connection, opts) {
        this.connections = new Map();
        this.common_connection = clone(common_connection);
        this.options = merge({}, default_options, opts);
        if (this.options.create_default)
            this.createPool(this.options.default_conn, 'default');
    }
    createPool(opts, name = 'default') {
        if (this.connections.has(name)) {
            throw new Error("pool already exists");
        }
        let config = merge({}, this.common_connection, opts);
        let conn = {
            c: new SQLWrapper(name, config),
            config,
        };
        this.connections.set(name, conn);
        return conn.c;
    }
    hasPool(name) {
        return this.connections.has(name);
    }
    /**
     *
     * @param name {string}
     * @returns {SQLWrapper|null}
     */
    getPool(name = 'default') {
        let conn = this.connections.get(name);
        if (conn) {
            this.connections.set(name, conn);
            return conn.c;
        }
        else {
            return null;
        }
    }
    /**
     *
     * @param name {string=}
     * @returns {Promise<SQLConnection>}
     */
    async connect(name) {
        let pool = this.getPool(name);
        if (pool !== null) {
            return await pool.connect();
        }
        else {
            return null;
        }
    }
    setCommonConnection(common) {
        this.common_connection = clone(common);
    }
    setDefaultOptions(options) {
        this.options = merge({}, this.options, options);
    }
}
