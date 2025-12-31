// GitHub OAuth configuration and helper functions
export const GITHUB_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
  redirectUri: typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback` : "",
  scope: "repo user",
  authUrl: "https://github.com/login/oauth/authorize",
}

export function getGitHubAuthUrl() {
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.clientId,
    redirect_uri: GITHUB_CONFIG.redirectUri,
    scope: GITHUB_CONFIG.scope,
  })
  return `${GITHUB_CONFIG.authUrl}?${params.toString()}`
}

export interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  email?: string
}

export function getStoredUser(): GitHubUser | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("github_user")
  return stored ? JSON.parse(stored) : null
}

export function storeUser(user: GitHubUser) {
  localStorage.setItem("github_user", JSON.stringify(user))
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("github_token")
}

export function storeToken(token: string) {
  localStorage.setItem("github_token", token)
}

export function clearAuth() {
  localStorage.removeItem("github_user")
  localStorage.removeItem("github_token")
}
