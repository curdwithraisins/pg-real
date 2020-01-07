/**
 * Functions for Postgres
 */

export namespace Functions {
    export function afterAll(schema: string, table: string): string {
        const name = schema + '_' + table;
        return `
      CREATE OR REPLACE FUNCTION ${name}_after_all_notifier() RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          PERFORM pg_notify(CAST('${name}_after_all' AS text), row_to_json(NEW)::text);
        ELSIF TG_OP = 'UPDATE' THEN
          PERFORM pg_notify(CAST('${name}_after_all' AS text), row_to_json(NEW)::text);
        ELSIF TG_OP = 'DELETE' THEN
          PERFORM pg_notify(CAST('${name}_after_all' AS text), row_to_json(OLD)::text);    
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE 'plpgsql';
    `;
    };

    export function beforeAll(schema: string, table: string): string {
        const name = schema + '_' + table;
        return `
      CREATE OR REPLACE FUNCTION ${name}_before_all_notifier() RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          PERFORM pg_notify(CAST('${name}_before_all' AS text), row_to_json(NEW)::text);
        ELSIF TG_OP = 'UPDATE' THEN
          PERFORM pg_notify(CAST('${name}_before_all' AS text), row_to_json(NEW)::text);
        ELSIF TG_OP = 'DELETE' THEN
          PERFORM pg_notify(CAST('${name}_before_all' AS text), row_to_json(OLD)::text);    
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE 'plpgsql';
    `;
    };

    export function afterInsert(schema: string, table: string): string {
        const name = schema + '_' + table;
        return `
        CREATE OR REPLACE FUNCTION ${name}_after_insert_notifier() RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'INSERT' THEN
            PERFORM pg_notify(CAST('${name}_after_insert' AS text), row_to_json(NEW)::text);
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
      `;
    };

    export function beforeInsert(schema: string, table: string): string {
        const name = schema + '_' + table;
        return `
        CREATE OR REPLACE FUNCTION ${name}_before_insert_notifier() RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'INSERT' THEN
            PERFORM pg_notify(CAST('${name}_before_insert' AS text), row_to_json(NEW)::text);
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
      `;
    };

    export function afterUpdate(schema: string, table: string): string {
        const name = schema + '_' + table;
        return `
        CREATE OR REPLACE FUNCTION ${name}_after_update_notifier() RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'UPDATE' THEN
            PERFORM pg_notify(CAST('${name}_after_update' AS text), row_to_json(NEW)::text);
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
      `;
    };

    export function beforeUpdate(schema: string, table: string): string {
        const name = schema + '_' + table;
        return `
        CREATE OR REPLACE FUNCTION ${name}_before_update_notifier() RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'UPDATE' THEN
            PERFORM pg_notify(CAST('${name}_before_update' AS text), row_to_json(NEW)::text);
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
      `;
    };

    export function afterDelete(schema: string, table: string): string {
        const name = schema + '_' + table;
        return `
        CREATE OR REPLACE FUNCTION ${name}_after_delete_notifier() RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'DELETE' THEN
            PERFORM pg_notify(CAST('${name}_after_delete' AS text), row_to_json(OLD)::text);
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
      `;
    };

    export function beforeDelete(schema: string, table: string): string {
        const name = schema + '_' + table;
        return `
        CREATE OR REPLACE FUNCTION ${name}_before_delete_notifier() RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'DELETE' THEN
            PERFORM pg_notify(CAST('${name}_before_delete' AS text), row_to_json(OLD)::text);
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
      `;
    };
}