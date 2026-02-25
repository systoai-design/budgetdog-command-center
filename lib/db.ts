import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || "file:budgetdog.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
    url,
    authToken,
});

export async function initDb() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS time_entries (
            id TEXT PRIMARY KEY,
            charge_code TEXT NOT NULL,
            category TEXT NOT NULL,
            duration INTEGER NOT NULL,
            notes TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_email TEXT,
            status TEXT DEFAULT 'approved' -- 'approved', 'pending'
        )
    `);

    try {
        await db.execute("ALTER TABLE time_entries ADD COLUMN user_email TEXT");
    } catch (error) {
        // Ignore error if column already exists
    }

    try {
        await db.execute("ALTER TABLE time_entries ADD COLUMN status TEXT DEFAULT 'approved'");
    } catch (error) {
        // Ignore error if column already exists
    }

    await db.execute(`
        CREATE TABLE IF NOT EXISTS super_admins (
            email TEXT PRIMARY KEY,
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS allowed_domains (
            domain TEXT PRIMARY KEY,
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS user_roles (
            email TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            updated_by TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}
