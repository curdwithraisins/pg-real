/**
 * Triggers for Postgres
 */
import { ITrigger } from '@pack-types/index';
import { isArray } from 'lodash';

export namespace Triggers {
    export function afterAll(schema: string, table: string, columns: string | string[] = ''): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        const cols = isArray(columns) ? columns.join(', ') : columns;
        return {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_all ON ${path};
                CREATE TRIGGER ${name}_after_all AFTER INSERT OR UPDATE OR DELETE ${cols} ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
                channel: `${name}_after_all`
            }
    }

    export function beforeAll(schema: string, table: string): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_all ON ${path};
                CREATE TRIGGER ${name}_before_all BEFORE INSERT OR UPDATE OR DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
                channel: `${name}_before_all`
            }
    }

    export function afterInsert(schema: string, table: string): ITrigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_insert ON ${path};
                CREATE TRIGGER ${name}_after_insert AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_insert_notifier();
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
                CREATE TRIGGER ${name}_before_insert BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_insert_notifier();
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
                CREATE TRIGGER ${name}_after_update AFTER UPDATE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_update_notifier();
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
                CREATE TRIGGER ${name}_before_update BEFORE UPDATE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_update_notifier();
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
                CREATE TRIGGER ${name}_after_delete AFTER DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_delete_notifier();
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
                CREATE TRIGGER ${name}_before_delete BEFORE DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_delete_notifier();
            `,
            channel: `${name}_before_delete`
        };
    }
}
