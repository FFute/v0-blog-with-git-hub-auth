import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/?error=no_token", request.url))
    }

    // Get user information
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    // Redirect to home with user data and token in URL (will be stored in localStorage)
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("token", tokenData.access_token)
    redirectUrl.searchParams.set(
      "user",
      JSON.stringify({
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        email: userData.email,
      }),
    )

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] GitHub auth error:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}
