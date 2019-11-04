/**
 * Triggers for Postgres
 */
export interface ITigger {
    trigger: string,
    channel: string,
}

export namespace Triggers {
    function afterAll(schema: string, table: string): ITigger[] {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return [
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_insert ON ${path};
                CREATE TRIGGER ${name}_after_insert AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
                channel: `${name}_after_all`
            },
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_update ON ${path};
                CREATE TRIGGER ${name}_after_update AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
                channel: `${name}_after_all`
            },
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_delete ON ${path};
                CREATE TRIGGER ${name}_after_delete AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_after_all_notifier();
            `,
                channel: `${name}_after_all`
            },
        ];
    };

    function beforeAll(schema: string, table: string): ITigger[] {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return [
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_insert ON ${path};
                CREATE TRIGGER ${name}_before_insert BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
                channel: `${name}_before_all`
            },
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_update ON ${path};
                CREATE TRIGGER ${name}_before_update BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
                channel: `${name}_before_all`
            },
            {
                trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_delete ON ${path};
                CREATE TRIGGER ${name}_before_delete BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_before_all_notifier();
            `,
                channel: `${name}_before_all`
            },
        ];
    };

    function afterInsert(schema: string, table: string): ITigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_insert ON ${path};
                CREATE TRIGGER ${name}_after_insert AFTER INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_after_insert`
        };
    };

    function beforeInsert(schema: string, table: string): ITigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_insert ON ${path};
                CREATE TRIGGER ${name}_before_insert BEFORE INSERT ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_before_insert`
        };
    };

    function afterUpdate(schema: string, table: string): ITigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_update ON ${path};
                CREATE TRIGGER ${name}_after_update AFTER UPDATE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_after_update`
        };
    };

    function beforeUpdate(schema: string, table: string): ITigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_update ON ${path};
                CREATE TRIGGER ${name}_before_update BEFORE UPDATE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_before_update`
        };
    };

    function afterDelete(schema: string, table: string): ITigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_after_delete ON ${path};
                CREATE TRIGGER ${name}_after_delete AFTER DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_after_delete`
        };
    };

    function beforDelete(schema: string, table: string): ITigger {
        const name = schema + '_' + table;
        const path = schema + '.' + table;
        return {
            trigger: `
                DROP TRIGGER IF EXISTS ${name}_before_delete ON ${path};
                CREATE TRIGGER ${name}_before_delete BEFORE DELETE ON ${path} FOR EACH ROW EXECUTE PROCEDURE ${name}_notifier();
            `,
            channel: `${name}_before_delete`
        };
    };
}
