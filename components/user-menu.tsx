"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type GitHubUser, getStoredUser, clearAuth } from "@/lib/github-auth"
import { LogOut, PenSquare, Settings, FileText } from "lucide-react"

export function UserMenu() {
  const [user, setUser] = useState<GitHubUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  const handleLogout = () => {
    clearAuth()
    setUser(null)
    window.location.href = "/"
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-10 rounded-full">
          <Avatar className="size-10">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name || user.login} />
            <AvatarFallback>{user.name?.[0] || user.login[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="size-8">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name || user.login} />
            <AvatarFallback>{user.name?.[0] || user.login[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{user.name || user.login}</p>
            <p className="text-xs text-muted-foreground">@{user.login}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/posts">
            <FileText className="mr-2 size-4" />
            My Posts
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/editor">
            <PenSquare className="mr-2 size-4" />
            New Post
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings">
            <Settings className="mr-2 size-4" />
            Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
