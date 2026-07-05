import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

function safeRedirectUrl(value: string | null, origin: string) {
	if (!value) return new URL("/", origin);

	const url = new URL(value, origin);
	return url.origin === origin ? url : new URL("/", origin);
}

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = safeRedirectUrl(requestUrl.searchParams.get("next"), requestUrl.origin);

	if (code) {
		const supabase = await createClient();
		await supabase.auth.exchangeCodeForSession(code);
	}

	return NextResponse.redirect(next);
}
