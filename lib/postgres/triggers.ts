/**
 * Triggers for Postgres
 */
import { ITrigger, ITriggerPath, ITriggerOptions } from "@pack-types/index";
import { isArray } from "lodash";
import * as uuid from "uuid";

export class Triggers {
    public static afterAll({schema = 'public', table}: ITriggerPath, columns: string | string[] = "", options: ITriggerOptions): ITrigger {
        const name = schema + "_" + table;
        const path = schema + "." + table;
        const cols = isArray(columns) ? columns.join(", ") : columns;
        return {
            name: `${name}_after_all${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_all ON ${path};
                CREATE TRIGGER ${name}_after_all AFTER INSERT OR UPDATE OR DELETE ${cols} ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
        };
    }

    public static beforeAll({schema = 'public', table}: ITriggerPath, options: ITriggerOptions): ITrigger {
        const name = schema + "_" + table;
        const path = schema + "." + table;
        return {
            name: `${name}_before_all${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_all ON ${path};
                CREATE TRIGGER ${name}_before_all BEFORE INSERT OR UPDATE OR DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
        };
    }

    public static afterInsert({schema = 'public', table}: ITriggerPath, options: ITriggerOptions): ITrigger {
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

    public static beforeInsert({schema = 'public', table}: ITriggerPath, options: ITriggerOptions): ITrigger {
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

    public static afterUpdate({schema = 'public', table}: ITriggerPath, options: ITriggerOptions): ITrigger {
        const name = schema + "_" + table;
        const path = schema + "." + table;
        return {
            name: `${name}_after_update${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_update ON ${path};
                CREATE TRIGGER ${name}_after_update AFTER UPDATE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_update_notifier();
            `,
        };
    }

    public static beforeUpdate({schema = 'public', table}: ITriggerPath, options: ITriggerOptions): ITrigger {
        const name = schema + "_" + table;
        const path = schema + "." + table;
        return {
            name: `${name}_before_update${options.unique ? "_" + uuid() : ''}`,
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_update ON ${path};
                CREATE TRIGGER ${name}_before_update BEFORE UPDATE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_update_notifier();
            `,
        };
    }

    public static afterDelete({schema = 'public', table}: ITriggerPath, options: ITriggerOptions): ITrigger {
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

    public static beforeDelete({schema = 'public', table}: ITriggerPath, options: ITriggerOptions): ITrigger {
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