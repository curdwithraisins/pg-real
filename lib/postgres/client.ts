/**
 * Postgres Client
 */
import { cloneDeep } from 'lodash';
import { ITrigger } from '@pack-types/index';
import { Client } from 'pg';
import { isArray } from 'lodash';

export class SubscriptionClient extends Client {
    public async setFunctions(funcs: string | string[]) {
        let list = cloneDeep(funcs);
        if (isArray(list)) {
            list = list.join('\n');
        }
        await this.query(list);
        return this;
    }

    public async dropFunctions(funcs: string | string[]) {
        let list = cloneDeep(funcs);
        if (isArray(list)) {
            list = list.join(', ');
        }
        await this.query(`DROP FUNCTION ${list}`);
        return this;
    }

    public async setTriggers(triggers: string | string[]) {
        let list = cloneDeep(triggers);
        if (isArray(list)) {
            list = list.join('\n');
        }
        await this.query(list);
        return this;
    }

    public async removeTriggers(triggersNames: string | string[], schema: string, table: string) {
        if (!schema || !table) {
            return new Error('Require schema and table.');
        }
        let list = cloneDeep(triggersNames);
        if (!isArray(list)) {
            list = [list];
        }
        await this.query(list.map((name) => `DROP TRIGGER IF EXISTS ${name} ON ${schema}.${table};`).join('\n'));
        return this;
    }

    public async setListeners(channels: string | string[]) {
        let list = cloneDeep(channels);
        if (!isArray(list)) {
            list = [list];
        }
        await this.query(list.map((channel: string) => `LISTEN ${channel};`).join('\n'));
        return this;
    }

    public async removeListeners(channels: string | string[]) {
        let list = cloneDeep(channels);
        if (!isArray(list)) {
            list = [list];
        }
        await this.query(list.map((channel: string) => `UNLISTEN ${channel};`).join('\n'));
        return this;
    }

    public setTriggersAndListeners(triggers: ITrigger | ITrigger[]) {
        let list = cloneDeep(triggers);
        if (!isArray(list)) {
            list = [list]
        }
        list.forEach(async ({trigger, channel}) => {
            await this.query(trigger);
            await this.query(`LISTEN ${channel}`);
        });
        return this;
    }

    public startListen(notify: any) {
        this.on('notification', notify);
    }
}