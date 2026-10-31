import { NextRequest, NextResponse } from "next/server";

// Step 1 of the Decap CMS <-> GitHub OAuth handshake.
// Decap opens a popup pointed at this route; it redirects the user to
// GitHub's own authorization screen.
export async function GET(request: NextRequest) {
  const clientId = process.env.OAUTH_CLIENT_ID;

  if (!clientId) {
    return new NextResponse(
      "Missing OAUTH_CLIENT_ID environment variable. Set it in your Vercel project settings.",
      { status: 500 }
    );
  }

  const redirectUri = `${request.nextUrl.origin}/api/callback`;

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo,user");

  return NextResponse.redirect(authorizeUrl.toString());
}
