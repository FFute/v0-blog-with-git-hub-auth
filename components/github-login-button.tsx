"use client"

import { Button } from "@/components/ui/button"
import { getGitHubAuthUrl } from "@/lib/github-auth"
import { Github } from "lucide-react"

export function GitHubLoginButton() {
  const handleLogin = () => {
    window.location.href = getGitHubAuthUrl()
  }

  return (
    <Button onClick={handleLogin} size="lg" className="gap-2">
      <Github className="size-5" />
      Sign in with GitHub
    </Button>
  )
}
