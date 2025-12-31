"use client"

import { useEffect, useState } from "react"
import { BlogHeader } from "@/components/blog-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GitHubAPI } from "@/lib/github-api"
import { getStoredUser } from "@/lib/github-auth"
import { Loader2, FolderGit2, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const user = getStoredUser()

  const [owner, setOwner] = useState("")
  const [folderName, setFolderName] = useState("blog")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserInfo()
    }
  }, [user])

  const loadUserInfo = async () => {
    setLoading(true)
    try {
      const api = new GitHubAPI()
      const userData = await api.getAuthenticatedUser()
      setOwner(userData.login)
    } catch (err) {
      console.error("Error loading user info:", err)
      toast({
        title: "Error",
        description: "Failed to load user information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!owner || !folderName) {
      toast({
        title: "Missing fields",
        description: "Please enter a folder name",
        variant: "destructive",
      })
      return
    }

    setCreating(true)

    try {
      const repo = GitHubAPI.FIXED_REPO
      const api = new GitHubAPI()

      // Create a .gitkeep file to initialize the folder
      const readmeContent = `# Blog Posts

This folder contains your blog posts written in Markdown.

## File Structure

Each post should be a Markdown file (.md) with frontmatter:

\`\`\`markdown
---
title: Your Post Title
date: 2025-01-01
---

Your post content here...
\`\`\`
`

      await api.createOrUpdateFile(
        owner,
        repo,
        `${folderName}/README.md`,
        readmeContent,
        `Initialize ${folderName} folder for blog posts`,
      )

      toast({
        title: "Success",
        description: `Created ${folderName} folder in ${owner}/${repo}`,
      })
    } catch (err) {
      console.error("Error creating folder:", err)
      toast({
        title: "Error",
        description: "Failed to create folder. Make sure you have the DevBlog repository and write access to it.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Please sign in to access settings</h2>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />

      <main className="container py-12">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Settings</h2>
            <p className="mt-2 text-muted-foreground">Configure your DevBlog repository</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderGit2 className="size-5" />
                Initialize Blog Repository
              </CardTitle>
              <CardDescription>Create a folder in your DevBlog repository to store blog posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  Repository:{" "}
                  <span className="font-medium text-foreground">
                    {owner}/{GitHubAPI.FIXED_REPO}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="folder">Folder Name</Label>
                <Input
                  id="folder"
                  placeholder="blog"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Common names: blog, posts, articles</p>
              </div>

              <Button onClick={handleCreateFolder} disabled={creating || loading} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Folder"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="size-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">1. GitHub Authentication</h4>
                <p className="text-muted-foreground">Sign in with your GitHub account to access your repositories.</p>
              </div>
              <div>
                <h4 className="font-semibold">2. Fixed Repository</h4>
                <p className="text-muted-foreground">
                  This blog uses your <strong>DevBlog</strong> repository exclusively to store all blog posts.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">3. Write and Publish</h4>
                <p className="text-muted-foreground">
                  Use the editor to write posts in Markdown with live preview, then save directly to your DevBlog
                  repository.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">4. Share Your Work</h4>
                <p className="text-muted-foreground">
                  Your posts are automatically rendered and can be shared with anyone who has access to view them.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
