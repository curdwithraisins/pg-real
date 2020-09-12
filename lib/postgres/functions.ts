/**
 * Functions for Postgres
 */
import { IFunction } from "@pack-types/index";

export class Functions {
    public static custom(name: string): IFunction {
        return {
            name: `${name}_notifier`,
            channel: name,
            function: `
                CREATE OR REPLACE FUNCTION ${name}_notifier() RETURNS TRIGGER AS $$
                BEGIN
                    IF TG_OP = 'INSERT' THEN
                        PERFORM pg_notify(CAST('${name}" 'S text), TG_OP, row_to_json(NEW)::text);
                    ELSIF TG_OP = 'UPDATE' THEN
                        PERFORM pg_notify(CAST('${name}" 'S text), TG_OP, row_to_json(NEW)::text);
                    ELSIF TG_OP = 'DELETE' THEN
                        PERFORM pg_notify(CAST('${name}" 'S text), TG_OP, row_to_json(OLD)::text);
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE "plpgsql";
            `,
        };
    }

    public static afterAll(schema: string, table: string): IFunction {
        const name = schema + "_" + table;
        return {
            name: `${name}_after_all_notifier`,
            channel: `${name}_after_all`,
            function: `
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
                $$ LANGUAGE "plpgsql";
            `,
        };
    }

    public static beforeAll(schema: string, table: string): IFunction {
        const name = schema + "_" + table;
        return {
            name: `${name}_before_all_notifier`,
            channel: `${name}_before_all`,
            function: `
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
                $$ LANGUAGE "plpgsql";
            `,
        };
    }

    public static afterInsert(schema: string, table: string): IFunction {
        const name = schema + "_" + table;
        return {
            name: `${name}_after_insert_notifier`,
            channel: `${name}_after_insert`,
            function: `
                CREATE OR REPLACE FUNCTION ${name}_after_insert_notifier() RETURNS TRIGGER AS $$
                BEGIN
                    IF TG_OP = 'INSERT' THEN
                        PERFORM pg_notify(CAST('${name}_after_insert' AS text), row_to_json(NEW)::text);
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE "plpgsql";
            `,
        };
    }

    public static beforeInsert(schema: string, table: string): IFunction {
        const name = schema + "_" + table;
        return {
            name: `${name}_before_insert_notifier`,
            channel: `${name}_before_insert`,
            function: `
                CREATE OR REPLACE FUNCTION ${name}_before_insert_notifier() RETURNS TRIGGER AS $$
                BEGIN
                    IF TG_OP = 'INSERT' THEN
                        PERFORM pg_notify(CAST('${name}_before_insert' AS text), row_to_json(NEW)::text);
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE "plpgsql";
            `,
        };
    }

    public static afterUpdate(schema: string, table: string): IFunction {
        const name = schema + "_" + table;
        return {
            name: `${name}_after_update_notifier`,
            channel: `${name}_after_update`,
            function: `
                CREATE OR REPLACE FUNCTION ${name}_after_update_notifier() RETURNS TRIGGER AS $$
                BEGIN
                    IF TG_OP = 'UPDATE' THEN
                        PERFORM pg_notify(CAST('${name}_after_update' AS text), row_to_json(NEW)::text);
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE "plpgsql";
            `,
        };
    }

    public static beforeUpdate(schema: string, table: string): IFunction {
        const name = schema + "_" + table;
        return {
            name: `${name}_before_update_notifier`,
            channel: `${name}_before_update`,
            function: `
                CREATE OR REPLACE FUNCTION ${name}_before_update_notifier() RETURNS TRIGGER AS $$
                BEGIN
                    IF TG_OP = 'UPDATE' THEN
                        PERFORM pg_notify(CAST('${name}_before_update' AS text), row_to_json(NEW)::text);
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE "plpgsql";
            `,
        };
    }

    public static afterDelete(schema: string, table: string): IFunction {
        const name = schema + "_" + table;
        return {
            name: `${name}_after_delete_notifier`,
            channel: `${name}_after_delete`,
            function: `
                CREATE OR REPLACE FUNCTION ${name}_after_delete_notifier() RETURNS TRIGGER AS $$
                BEGIN
                    IF TG_OP = 'DELETE' THEN
                        PERFORM pg_notify(CAST('${name}_after_delete' AS text), row_to_json(OLD)::text);
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE "plpgsql";
            `,
        };
    }

    public static beforeDelete(schema: string, table: string): IFunction {
        const name = schema + "_" + table;
        return {
            name: `${name}_before_delete_notifier`,
            channel: `${name}_before_delete`,
            function: `
                CREATE OR REPLACE FUNCTION ${name}_before_delete_notifier() RETURNS TRIGGER AS $$
                BEGIN
                    IF TG_OP = 'DELETE' THEN
                        PERFORM pg_notify(CAST('${name}_before_delete' AS text), row_to_json(OLD)::text);
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE "plpgsql";
            `,
        };
    }
}
