import { NextRequest, NextResponse } from "next/server";

// Step 2 of the handshake. GitHub redirects back here with a ?code=...
// This exchanges that code for an access token, then returns a small
// HTML page that posts the token back to the Decap CMS popup window
// using the exact message format Decap's GitHub backend expects.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    return new NextResponse("Missing authorization code from GitHub.", {
      status: 400,
    });
  }

  if (!clientId || !clientSecret) {
    return new NextResponse(
      "Missing OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET environment variables. Set them in your Vercel project settings.",
      { status: 500 }
    );
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (tokenData.error || !tokenData.access_token) {
    return new NextResponse(
      `GitHub OAuth error: ${tokenData.error_description ?? "unknown error"}`,
      { status: 400 }
    );
  }

  const payload = JSON.stringify({
    token: tokenData.access_token,
    provider: "github",
  }).replace(/</g, "\\u003c");

  const html = `<!DOCTYPE html>
<html>
  <body>
    <script>
      (function() {
        function receiveMessage(message) {
          window.opener.postMessage(
            'authorization:github:success:${payload}',
            message.origin
          );
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
