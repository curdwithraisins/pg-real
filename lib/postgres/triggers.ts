/**
 * Triggers for Postgres
 */
import { ITrigger } from '@pack-types/index';

export namespace Triggers {
    export function afterAll(schema: string, table: string): ITrigger[] {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return [
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_insert ON ${path};
                CREATE TRIGGER ${name}_after_insert AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
                channel: `${name}_after_insert`
            },
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_update ON ${path};
                CREATE TRIGGER ${name}_after_update AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
                channel: `${name}_after_update`
            },
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_delete ON ${path};
                CREATE TRIGGER ${name}_after_delete AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
                channel: `${name}_after_delete`
            },
        ];
    }

    export function beforeAll(schema: string, table: string): ITrigger[] {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return [
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_insert ON ${path};
                CREATE TRIGGER ${name}_before_insert BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
                channel: `${name}_before_insert`
            },
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_update ON ${path};
                CREATE TRIGGER ${name}_before_update BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
                channel: `${name}_before_update`
            },
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_delete ON ${path};
                CREATE TRIGGER ${name}_before_delete BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
                channel: `${name}_before_delete`
            },
        ];
    }

    export function afterInsert(schema: string, table: string): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_insert ON ${path};
                CREATE TRIGGER ${name}_after_insert AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_after_insert`
        };
    }

    export function beforeInsert(schema: string, table: string): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_insert ON ${path};
                CREATE TRIGGER ${name}_before_insert BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_before_insert`
        };
    }

    export function afterUpdate(schema: string, table: string): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_update ON ${path};
                CREATE TRIGGER ${name}_after_update AFTER UPDATE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_after_update`
        };
    }

    export function beforeUpdate(schema: string, table: string): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_update ON ${path};
                CREATE TRIGGER ${name}_before_update BEFORE UPDATE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_before_update`
        };
    }

    export function afterDelete(schema: string, table: string): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_delete ON ${path};
                CREATE TRIGGER ${name}_after_delete AFTER DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_after_delete`
        };
    }

    export function beforDelete(schema: string, table: string): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_delete ON ${path};
                CREATE TRIGGER ${name}_before_delete BEFORE DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_before_delete`
        };
    }
}
