/**
 * Triggers for Postgres
 */
import { ITrigger, ITriggerPath, ITriggerOptions } from "@pack-types/index";
import { isArray } from "lodash";
import * as uuid from "uuid";

export class Triggers {
    public static custom(
            { schema = 'public', table, columns = [], triggerName = '' }: ITriggerPath,
            { when, before = false, insert: i, update: u, delete: d }: ITriggerOptions = {}
    ): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        if (!triggerName) return new Error('Trigger name should be defined.');
        const path = schema + "." + table;
        const cols = columns.join(", ");
        const event = [i && 'INSERT', u && ('UPDATE' + (cols ? ' OF ' + cols : '')), d && 'DELETE'].filter(Boolean).join(' OR ') || 'UPDATE';
        return {
            name: triggerName,
            trigger: `
                DROP TRIGGER IF EXISTS ${triggerName} ON ${path};
                CREATE TRIGGER ${triggerName} ${before ? 'BEFORE' : 'AFTER'} ${event} ${cols} ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${triggerName}_notifier();
            `,
        };
    }

    public static afterAll({schema = 'public', table, columns = []}: ITriggerPath, { unique, when }: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = `${schema}_${table}${columns.length ? "_" + columns.join('_') : ''}_after_all${unique ? "_" + uuid() : ''}`;
        const path = schema + "." + table;
        const cols = columns.join(", ");
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} AFTER INSERT OR UPDATE ${cols ? 'OF' + cols : ''} OR DELETE ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }

    public static beforeAll({schema = 'public', table, columns = []}: ITriggerPath, { unique, when }: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = `${schema}_${table}${columns.length ? "_" + columns.join('_') : ''}_before_all${unique ? "_" + uuid() : ''}`;
        const path = schema + "." + table;
        const cols = columns.join(", ");
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} BEFORE INSERT OR UPDATE ${cols ? 'OF' + cols : ''} OR DELETE ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }

    public static afterInsert({schema = 'public', table}: ITriggerPath, { unique, when }: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = `${schema}_${table}_after_insert${unique ? "_" + uuid() : ''}`;
        const path = schema + "." + table;
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} AFTER INSERT ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }

    public static beforeInsert({schema = 'public', table}: ITriggerPath, { unique, when }: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = `${schema}_${table}_before_insert${unique ? "_" + uuid() : ''}`;
        const path = schema + "." + table;
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} BEFORE INSERT ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }

    public static afterUpdate({schema = 'public', table, columns = []}: ITriggerPath, { unique, when }: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = `${schema}_${table}${columns.length ? "_" + columns.join('_') : ''}_after_update${unique ? "_" + uuid() : ''}`;
        const path = schema + "." + table;
        const cols = columns.join(", ");
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} AFTER UPDATE ${cols ? 'OF' + cols : ''} ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }

    public static beforeUpdate({schema = 'public', table, columns = []}: ITriggerPath, { unique, when }: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = `${schema}_${table}${columns.length ? "_" + columns.join('_') : ''}_before_update${unique ? "_" + uuid() : ''}`;
        const path = schema + "." + table;
        const cols = columns.join(", ");
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} BEFORE UPDATE ${cols ? 'OF' + cols : ''} ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }

    public static afterDelete({schema = 'public', table}: ITriggerPath, { unique, when }: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = `${schema}_${table}_after_delete${unique ? "_" + uuid() : ''}`;
        const path = schema + "." + table;
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} AFTER DELETE ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }

    public static beforeDelete({schema = 'public', table}: ITriggerPath, { unique, when }: ITriggerOptions = {}): ITrigger | Error {
        if (!table) return new Error('Table name should be defined.');
        const name = `${schema}_${table}_before_delete${unique ? "_" + uuid() : ''}`;
        const path = schema + "." + table;
        return {
            name,
            trigger: `
                DROP TRIGGER IF EXISTS ${name} ON ${path};
                CREATE TRIGGER ${name} BEFORE DELETE ON ${path} FOR EACH ROW ${when ? `WHEN (${when})` : ''} EXECUTE PROCEDURE ${name}_notifier();
            `,
        };
    }
}