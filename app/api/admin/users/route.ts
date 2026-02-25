import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        // In a real app, verify the request is from a superadmin via session token
        // For now, we trust the internal network/middleware

        const { data, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) throw error;

        return NextResponse.json({ users: data.users });
    } catch (error: any) {
        console.error("Error listing users:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
