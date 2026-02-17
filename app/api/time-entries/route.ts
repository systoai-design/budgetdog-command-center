import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        await initDb();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
        const isAdmin = searchParams.get("admin") === "true";

        let result;
        if (isAdmin) {
            result = await db.execute("SELECT * FROM time_entries ORDER BY timestamp DESC");
        } else if (email) {
            result = await db.execute({
                sql: "SELECT * FROM time_entries WHERE user_email = ? ORDER BY timestamp DESC",
                args: [email]
            });
        } else {
            // Default to all if no filter provided (fallback) or empty
            result = await db.execute("SELECT * FROM time_entries ORDER BY timestamp DESC");
        }

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await initDb();
        const body = await request.json();
        const { id, chargeCode, category, duration, notes, timestamp, userEmail, status } = body;

        await db.execute({
            sql: "INSERT INTO time_entries (id, charge_code, category, duration, notes, timestamp, user_email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [id, chargeCode, category, duration, notes, timestamp, userEmail || null, status || 'approved'],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await initDb();
        const body = await request.json();
        const { id, status, ...updates } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // Build dynamic update query
        const fields: string[] = [];
        const args: any[] = [];

        if (status) {
            fields.push("status = ?");
            args.push(status);
        }

        // Handle other fields if provided (for editing)
        if (updates.chargeCode) { fields.push("charge_code = ?"); args.push(updates.chargeCode); }
        if (updates.duration) { fields.push("duration = ?"); args.push(updates.duration); }
        if (updates.notes !== undefined) { fields.push("notes = ?"); args.push(updates.notes); }

        if (fields.length === 0) return NextResponse.json({ success: true }); // Nothing to update

        args.push(id); // For WHERE clause

        await db.execute({
            sql: `UPDATE time_entries SET ${fields.join(", ")} WHERE id = ?`,
            args
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await initDb();
        // Handle ID via URL param or search param (since standard delete doesn't have body)
        // Our previous component called `/api/time-entries/${id}` which is a route param...
        // But Next.js App Router for this file path `app/api/time-entries/route.ts` handles `/api/time-entries`.
        // So likely the client was doing `/api/time-entries?id=...` OR we need a `[id]/route.ts`.
        // Wait, the client code I wrote used `/api/time-entries/${state.id}`.
        // This means we need `app/api/time-entries/[id]/route.ts`!
        // But I am editing `app/api/time-entries/route.ts`.
        // Let's check if `app/api/time-entries/[id]/route.ts` exists.
        // If not, I should probably handle DELETE here via ID payload if possible, BUT fetch DELETE with body is rare/discouraged.
        // Or I check if I missed viewing the `[id]` folder.

        // Assuming I should just use Query Param for simplicity here to avoid creating new file unless I have to.
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            // If ID is not in query, check if there's a dynamic path (unlikely in this file).
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await db.execute({
            sql: "DELETE FROM time_entries WHERE id = ?",
            args: [id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }
}
