import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Send invite email (expires based on Supabase project settings, typically 24h or 1 week)
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            // Optional: redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        });

        if (error) throw error;

        return NextResponse.json({ success: true, user: data.user });
    } catch (error: any) {
        console.error("Error sending invite:", error);
        return NextResponse.json({ error: error.message || "Failed to send invite" }, { status: 500 });
    }
}
