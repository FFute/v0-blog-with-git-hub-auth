"use client"

import { useEffect, useState } from "react"
import { BlogHeader } from "@/components/blog-header"
import { BlogPostCard } from "@/components/blog-post-card"
import { Button } from "@/components/ui/button"
import { GitHubAPI, type BlogPost, parseMarkdownFrontmatter } from "@/lib/github-api"
import { getStoredUser } from "@/lib/github-auth"
import { Loader2 } from "lucide-react"

export default function PostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [owner, setOwner] = useState<string>("")
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    if (user) {
      loadPosts()
    }
  }, [])

  const loadPosts = async () => {
    const currentUser = getStoredUser()
    if (!currentUser) {
      setError("Please sign in to view posts")
      return
    }

    setLoading(true)
    setError("")
    setPosts([])

    try {
      const api = new GitHubAPI()
      const userData = await api.getAuthenticatedUser()
      const currentOwner = userData.login
      setOwner(currentOwner)

      const repo = GitHubAPI.FIXED_REPO

      const repoExists = await api.checkRepoExists(currentOwner, repo)
      if (!repoExists) {
        console.log("[v0] Repository doesn't exist, creating...")
        try {
          await api.createRepo(repo, "My personal blog powered by GitHub", true)
          setError(
            "DevBlog repository was just created. Please create a 'blog' or 'posts' folder in the settings page.",
          )
          setLoading(false)
          return
        } catch (createErr) {
          console.error("[v0] Error creating repository:", createErr)
          setError("Failed to create DevBlog repository. Please create it manually on GitHub.")
          setLoading(false)
          return
        }
      }

      let files: any[] = []
      let postsPath = "blog"

      files = await api.getRepoContents(currentOwner, repo, "blog", true)

      if (!files) {
        files = await api.getRepoContents(currentOwner, repo, "posts", true)
        postsPath = "posts"
      }

      if (!files || files.length === 0) {
        setError(
          "No blog or posts folder found in the DevBlog repository. Please create a 'blog' or 'posts' folder and add some markdown files.",
        )
        setLoading(false)
        return
      }

      const mdFiles = files.filter((file: any) => file.name.endsWith(".md") || file.name.endsWith(".mdx"))

      const postsDataPromises = mdFiles.map(async (file) => {
        try {
          const content = await api.getFileContent(currentOwner, repo, file.path)
          const { frontmatter, body } = parseMarkdownFrontmatter(content)

          const title = frontmatter.title || file.name.replace(/\.mdx?$/, "")
          const date = frontmatter.date || new Date().toISOString()
          const excerpt = frontmatter.excerpt || body.substring(0, 150).trim() + "..."
          const slug = file.name.replace(/\.mdx?$/, "")

          return {
            title,
            slug,
            date,
            content: body,
            excerpt,
            sha: file.sha,
          }
        } catch (err) {
          console.error(`Error loading file ${file.name}:`, err)
          return null
        }
      })

      const postsData = (await Promise.all(postsDataPromises)).filter((post): post is BlogPost => post !== null)

      postsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setPosts(postsData)
    } catch (err) {
      console.error("Error loading posts:", err)
      setError(
        "Failed to load posts from DevBlog repository. Please check if the repository exists and you have access to it.",
      )
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Please sign in to view posts</h2>
            <p className="mt-4 text-muted-foreground">
              You need to authenticate with GitHub to access your blog posts.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />

      <main className="container py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">DevBlog</h2>
          <p className="mt-2 text-muted-foreground">Posts from your DevBlog repository</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading posts...</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found in your DevBlog repository.</p>
            <Button className="mt-4" asChild>
              <a href="/editor">Create your first post</a>
            </Button>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
