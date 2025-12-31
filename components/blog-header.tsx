"use client"

import { PenSquare } from "lucide-react"
import { GitHubLoginButton } from "./github-login-button"
import { UserMenu } from "./user-menu"
import { getStoredUser } from "@/lib/github-auth"
import { useEffect, useState } from "react"
import type { GitHubUser } from "@/lib/github-auth"
import Link from "next/link"

export function BlogHeader() {
  const [user, setUser] = useState<GitHubUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <PenSquare className="size-6" />
          <h1 className="text-xl font-semibold">DevBlog</h1>
        </Link>
        {user ? <UserMenu /> : <GitHubLoginButton />}
      </div>
    </header>
  )
}
