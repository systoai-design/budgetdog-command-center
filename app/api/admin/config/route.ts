import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await initDb();
        const admins = await db.execute("SELECT * FROM super_admins");
        const domains = await db.execute("SELECT * FROM allowed_domains");
        const roles = await db.execute("SELECT email, role FROM user_roles");

        const rolesMap = roles.rows.reduce((acc: Record<string, string>, row: any) => {
            acc[row.email] = row.role;
            return acc;
        }, {});

        return NextResponse.json({
            admins: admins.rows,
            domains: domains.rows,
            roles: rolesMap
        });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDb();
        const body = await request.json();
        const { type, value, userEmail } = body; // type: 'admin' | 'domain'

        if (!value) return NextResponse.json({ error: "Value required" }, { status: 400 });

        if (type === 'admin') {
            await db.execute({
                sql: "INSERT INTO super_admins (email, added_by) VALUES (?, ?)",
                args: [value, userEmail]
            });
        } else if (type === 'domain') {
            await db.execute({
                sql: "INSERT INTO allowed_domains (domain, added_by) VALUES (?, ?)",
                args: [value, userEmail]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await initDb();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const value = searchParams.get('value');

        if (!value) return NextResponse.json({ error: "Value required" }, { status: 400 });

        if (type === 'admin') {
            // Prevent deleting the fail-safe admin
            if (value === 'systo.ai@gmail.com') {
                return NextResponse.json({ error: "Cannot delete master admin" }, { status: 403 });
            }
            await db.execute({
                sql: "DELETE FROM super_admins WHERE email = ?",
                args: [value]
            });
        } else if (type === 'domain') {
            await db.execute({
                sql: "DELETE FROM allowed_domains WHERE domain = ?",
                args: [value]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
