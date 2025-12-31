"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BlogHeader } from "@/components/blog-header"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Button } from "@/components/ui/button"
import { GitHubAPI, parseMarkdownFrontmatter } from "@/lib/github-api"
import { getStoredUser } from "@/lib/github-auth"
import { ArrowLeft, Calendar, Loader2, Pencil } from "lucide-react"
import Link from "next/link"

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<{
    title: string
    date: string
    content: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const storedUser = getStoredUser()
      if (!storedUser) {
        setLoading(false)
        return
      }

      setUser(storedUser)

      if (!params.slug) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError("")

      try {
        const api = new GitHubAPI()
        const owner = storedUser.login
        const repo = GitHubAPI.FIXED_REPO
        const slug = params.slug as string

        console.log("[v0] Loading post:", { owner, repo, slug })

        let filePath = ""
        let fileFound = false

        const blogFiles = await api.getRepoContents(owner, repo, "blog", true)
        console.log("[v0] Blog files:", blogFiles)

        if (blogFiles && Array.isArray(blogFiles)) {
          const file = blogFiles.find((f: any) => f.name === `${slug}.md` || f.name === `${slug}.mdx`)
          if (file) {
            filePath = file.path
            fileFound = true
            console.log("[v0] Found in blog folder:", filePath)
          }
        }

        if (!fileFound) {
          const postsFiles = await api.getRepoContents(owner, repo, "posts", true)
          console.log("[v0] Posts files:", postsFiles)

          if (postsFiles && Array.isArray(postsFiles)) {
            const file = postsFiles.find((f: any) => f.name === `${slug}.md` || f.name === `${slug}.mdx`)
            if (file) {
              filePath = file.path
              fileFound = true
              console.log("[v0] Found in posts folder:", filePath)
            }
          }
        }

        if (!fileFound) {
          console.log("[v0] Post not found, slug searched:", slug)
          setError(
            `Post "${slug}" not found. If you just created this post, please wait a few seconds and refresh the page.`,
          )
          setLoading(false)
          return
        }

        const content = await api.getFileContent(owner, repo, filePath)
        const { frontmatter, body } = parseMarkdownFrontmatter(content)

        setPost({
          title: frontmatter.title || slug,
          date: frontmatter.date || new Date().toISOString(),
          content: body,
        })
        console.log("[v0] Post loaded successfully")
      } catch (err) {
        console.error("[v0] Error loading post:", err)
        setError("Failed to load post. Please try refreshing the page.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.slug]) // Only depend on slug, user is loaded internally

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Please sign in to view this post</h2>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />

      <main className="container py-12">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 bg-transparent"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {post && (
            <article>
              <header className="mb-8">
                <h1 className="text-balance text-4xl font-bold tracking-tight">{post.title}</h1>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/editor?slug=${params.slug}`}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </header>

              <MarkdownRenderer content={post.content} />
            </article>
          )}
        </div>
      </main>
    </div>
  )
}
