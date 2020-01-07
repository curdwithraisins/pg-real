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
        this.connect();
        await this.query(list);
        this.end();
        return this;
    }

    public async setTriggers(triggers: string | string[]) {
        let list = cloneDeep(triggers);
        if (isArray(list)) {
            list = list.join('\n');
        }
        this.connect();
        await this.query(list);
        this.end();
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
        this.connect();
        await this.query(list.map((name) => `DROP TRIGGER IF EXISTS ${name} ON ${schema}.${table};`).join('\n'));
        this.end();
        return this;
    }

    public async setListeners(channels: string | string[]) {
        let list = cloneDeep(channels);
        if (!isArray(list)) {
            list = [list];
        }
        this.connect();
        await this.query(list.map((channel: string) => `LISTEN ${channel};`).join('\n'));
        this.end();
        return this;
    }

    public async removeListeners(channels: string | string[]) {
        let list = cloneDeep(channels);
        if (!isArray(list)) {
            list = [list];
        }
        this.connect();
        await this.query(list.map((channel: string) => `UNLISTEN ${channel};`).join('\n'));
        this.end();
        return this;
    }

    public setTriggersAndListeners(triggers: ITrigger | ITrigger[]) {
        let list = cloneDeep(triggers);
        if (!isArray(list)) {
            list = [list]
        }
        this.connect();
        list.forEach(async ({trigger, channel}) => {
            await this.query(trigger);
            await this.query(`LISTEN ${channel}`);
        });
        this.end();
        return this;
    }

    public startListen(notify: any) {
        this.connect();
        this.on('notification', notify);
    }
}