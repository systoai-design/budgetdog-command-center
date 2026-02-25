import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export async function GET(request: Request) {
    try {
        await initDb();
        const result = await db.execute("SELECT email, role FROM user_roles");

        // Convert array of rows into a dictionary mapping email -> role
        const rolesMap = result.rows.reduce((acc: Record<string, string>, row: any) => {
            acc[row.email] = row.role;
            return acc;
        }, {});

        return NextResponse.json({ roles: rolesMap });
    } catch (error: any) {
        console.error("Error fetching user roles:", error);
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDb();
        const body = await request.json();
        const { email, role, updatedBy } = body;

        if (!email || !role) {
            return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
        }

        // Upsert the role into the database
        await db.execute({
            sql: `
                INSERT INTO user_roles (email, role, updated_by, updated_at) 
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(email) DO UPDATE SET 
                    role = excluded.role, 
                    updated_by = excluded.updated_by, 
                    updated_at = excluded.updated_at
            `,
            args: [email, role, updatedBy || 'system']
        });

        return NextResponse.json({ success: true, email, role });
    } catch (error: any) {
        console.error("Error assigning user role:", error);
        return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
    }
}
