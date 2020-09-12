/**
 * Triggers for Postgres
 */
import { ITrigger, ITriggerPath, ITriggerOptions } from "@pack-types/index";
import { isArray } from "lodash";
import * as uuid from "uuid";

export class Triggers {
    public static custom(
            { schema = 'public', table, columns = [], triggerName = '' }: ITriggerPath,
            { unique, when, before = false, insert: i, update: u, delete: d }: ITriggerOptions = {}
        ): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = triggerName || schema + "_" + table + (columns.length ? "_" + columns.join('_') : '') + (unique ? "_" + uuid() : '');
        const path = schema + "." + table;
        const cols = columns.join(", ");
        const event = [i && 'INSERT', u && ('UPDATE' + (cols ? ' OF ' + cols : '')), d && 'DELETE'].filter(Boolean).join(' OR ') || 'UPDATE';
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} ${before ? 'BEFORE' : 'AFTER'} ${event} ${cols} ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }

    public static afterAll({schema = 'public', table, columns = []}: ITriggerPath, options: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = schema + "_" + table + (columns.length ? "_" + columns.join('_') : '');
        const path = schema + "." + table;
        const cols = columns.join(", ");
        return {
            name: `${name}_after_all${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_all ON ${path};
                CREATE TRIGGER ${name}_after_all AFTER INSERT OR UPDATE ${cols ? 'OF' + cols : ''} OR DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
        };
    }

    public static beforeAll({schema = 'public', table, columns = []}: ITriggerPath, options: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = schema + "_" + table + (columns.length ? "_" + columns.join('_') : '');
        const path = schema + "." + table;
        const cols = columns.join(", ");
        return {
            name: `${name}_before_all${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_all ON ${path};
                CREATE TRIGGER ${name}_before_all BEFORE INSERT OR UPDATE ${cols ? 'OF' + cols : ''} OR DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
        };
    }

    public static afterInsert({schema = 'public', table}: ITriggerPath, options: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = schema + "_" + table;
        const path = schema + "." + table;
        return {
            name: `${name}_after_insert${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_insert ON ${path};
                CREATE TRIGGER ${name}_after_insert AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_insert_notifier();
            `,
        };
    }

    public static beforeInsert({schema = 'public', table}: ITriggerPath, options: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = schema + "_" + table;
        const path = schema + "." + table;
        return {
            name: `${name}_before_insert${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_insert ON ${path};
                CREATE TRIGGER ${name}_before_insert BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_insert_notifier();
            `,
        };
    }

    public static afterUpdate({schema = 'public', table, columns = []}: ITriggerPath, options: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = schema + "_" + table + (columns.length ? "_" + columns.join('_') : '');
        const path = schema + "." + table;
        const cols = columns.join(", ");
        return {
            name: `${name}_after_update${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_update ON ${path};
                CREATE TRIGGER ${name}_after_update AFTER UPDATE ${cols ? 'OF' + cols : ''} ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_update_notifier();
            `,
        };
    }

    public static beforeUpdate({schema = 'public', table, columns = []}: ITriggerPath, options: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = schema + "_" + table + (columns.length ? "_" + columns.join('_') : '');
        const path = schema + "." + table;
        const cols = columns.join(", ");
        return {
            name: `${name}_before_update${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_update ON ${path};
                CREATE TRIGGER ${name}_before_update BEFORE UPDATE ${cols ? 'OF' + cols : ''} ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_update_notifier();
            `,
        };
    }

    public static afterDelete({schema = 'public', table}: ITriggerPath, options: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = schema + "_" + table;
        const path = schema + "." + table;
        return {
            name: `${name}_after_delete${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_delete ON ${path};
                CREATE TRIGGER ${name}_after_delete AFTER DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_delete_notifier();
            `,
        };
    }

    public static beforeDelete({schema = 'public', table}: ITriggerPath, options: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = schema + "_" + table;
        const path = schema + "." + table;
        return {
            name: `${name}_before_delete${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_delete ON ${path};
                CREATE TRIGGER ${name}_before_delete BEFORE DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_delete_notifier();
            `,
        };
    }
}