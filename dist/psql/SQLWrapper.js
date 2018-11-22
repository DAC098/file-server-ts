import pg from "pg";
import SQLConnection from "./SQLConnection";
const to_object_defaults = {
    array_keys: [],
    id_field: 'id',
    field_separator: '__'
};
export default class SQLWrapper {
    constructor(name, config) {
        this._c = new pg.Pool(config);
        this.closed = false;
    }
    async connect() {
        return new SQLConnection(await this._c.connect(), this);
    }
    async end() {
        await this._c.end();
        this.closed = true;
    }
}
