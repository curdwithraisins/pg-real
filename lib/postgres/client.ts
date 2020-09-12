/**
 * Postgres Client
 */
import { ISubClient } from "@pack-types/index";
import { cloneDeep, isArray } from "lodash";
import { Client } from "pg";

export class SubClient extends Client implements ISubClient {
    /**
     * Set trigger function
     * @param funcs: string | string[] - trigger function or list of functions to set
     */
    public async setFunctions(funcs: string | string[]) {
        let list = cloneDeep(funcs);
        if (isArray(list)) {
            list = list.join("\n");
        }
        await this.query(list);
        return this;
    }

    /**
     * Drop trigger function
     * @param funcsName: string | string[] - function name or list of names to drop
     */
    public async dropFunctions(funcsName: string | string[]) {
        let list = cloneDeep(funcsName);
        if (isArray(list)) {
            list = list.join(", ");
        }
        await this.query(`DROP FUNCTION ${list}`);
        return this;
    }

    /**
     * Set trigger
     * @param triggers: string | string[] - trigger or list of triggers
     */
    public async setTriggers(triggers: string | string[]) {
        let list = cloneDeep(triggers);
        if (isArray(list)) {
            list = list.join("\n");
        }
        await this.query(list);
        return this;
    }

    /**
     * Drop trigger
     * @param triggersNames: string | string[] - trigger name or list of names
     * @param schema: string - schema name
     * @param table: string - table name
     */
    public async dropTriggers(triggersNames: string | string[], schema: string, table: string) {
        if (!schema || !table) {
            return new Error("Require schema and table.");
        }
        let list = cloneDeep(triggersNames);
        if (!isArray(list)) {
            list = [list];
        }
        await this.query(list.map((name) => `DROP TRIGGER IF EXISTS ${name} ON ${schema}.${table};`).join("\n"));
        return this;
    }

    /**
     * Set listeners and start notification process for it
     * @param channels: string | string[] - channel or list of channels
     */
    public async setListeners(channels: string | string[]) {
        let list = cloneDeep(channels);
        if (!isArray(list)) {
            list = [list];
        }
        await Promise.all(list.map((channel: string) => this.query(`LISTEN ${channel};`)));
        return this;
    }

    /**
     * Drop listener and stop notification process for it
     * @param channels: string | string[] - channel or list of channels
     */
    public async dropListeners(channels: string | string[]) {
        let list = cloneDeep(channels);
        if (!isArray(list)) {
            list = [list];
        }
        await Promise.all(list.map((channel: string) => this.query(`UNLISTEN ${channel};`)));
        return this;
    }

    /**
     * Set function which will be triggered when event occurs
     * Only one function can be set!
     * @param notify: any - notification function
     */
    public setNotifier(notify: any) {
        this.on("notification", notify);
    }
}
