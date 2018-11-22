export type role_details = {

}

type role_sets = {
    [name: string]: role_details
}

export default class RBAC {
    private roles: role_sets;

    constructor() {

    }

    addRoll(name: string, role: role_details) {

    }
}