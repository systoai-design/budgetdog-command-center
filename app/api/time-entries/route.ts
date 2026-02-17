import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await initDb();
        const result = await db.execute("SELECT * FROM time_entries ORDER BY timestamp DESC");
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
        const { id, chargeCode, category, duration, notes, timestamp } = body;

        await db.execute({
            sql: "INSERT INTO time_entries (id, charge_code, category, duration, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
            args: [id, chargeCode, category, duration, notes, timestamp],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
    }
}
