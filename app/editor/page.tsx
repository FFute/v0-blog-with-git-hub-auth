"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BlogHeader } from "@/components/blog-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { GitHubAPI, createMarkdownWithFrontmatter, createSlug } from "@/lib/github-api"
import { getStoredUser } from "@/lib/github-auth"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [user, setUser] = useState(() => getStoredUser())
  const [owner, setOwner] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [originalSlug, setOriginalSlug] = useState("")
  const [fileSha, setFileSha] = useState("")

  const slug = useMemo(() => searchParams.get("slug"), [searchParams])

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        const api = new GitHubAPI()
        const userData = await api.getAuthenticatedUser()
        setOwner(userData.login)

        // Load existing post if slug is provided
        if (slug) {
          setEditMode(true)
          setOriginalSlug(slug)
          setLoading(true)

          const currentOwner = userData.login
          const repo = GitHubAPI.FIXED_REPO

          let filePath = ""
          let fileData: any = null

          try {
            const blogFiles = await api.getRepoContents(currentOwner, repo, "blog")
            fileData = blogFiles.find((f: any) => f.name === `${slug}.md` || f.name === `${slug}.mdx`)
            if (fileData) {
              filePath = fileData.path
            }
          } catch {
            try {
              const postsFiles = await api.getRepoContents(currentOwner, repo, "posts")
              fileData = postsFiles.find((f: any) => f.name === `${slug}.md` || f.name === `${slug}.mdx`)
              if (fileData) {
                filePath = fileData.path
              }
            } catch (e) {
              console.error("Error loading post:", e)
            }
          }

          if (filePath && fileData) {
            const fileContent = await api.getFileContent(currentOwner, repo, filePath)
            setFileSha(fileData.sha)

            const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
            const match = fileContent.match(frontmatterRegex)

            if (match) {
              const frontmatterLines = match[1].split("\n")
              const titleLine = frontmatterLines.find((line) => line.startsWith("title:"))
              if (titleLine) {
                setTitle(
                  titleLine
                    .replace("title:", "")
                    .trim()
                    .replace(/^["']|["']$/g, ""),
                )
              }
              setContent(match[2].trim())
            } else {
              setContent(fileContent)
            }
          }

          setLoading(false)
        }
      } catch (err) {
        console.error("Error loading data:", err)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    loadData()
  }, []) // Empty dependency array - only run once on mount

  const handleSave = async () => {
    if (!title || !content || !owner) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const repo = GitHubAPI.FIXED_REPO
      const api = new GitHubAPI()
      const slug = editMode ? originalSlug : createSlug(title)
      const date = new Date().toISOString().split("T")[0]
      const markdownContent = createMarkdownWithFrontmatter(title, date, content)

      let folderPath = "blog"
      const blogExists = await api.getRepoContents(owner, repo, "blog", true)
      if (!blogExists) {
        folderPath = "posts"
      }

      const filePath = `${folderPath}/${slug}.md`
      const commitMessage = editMode ? `Update post: ${title}` : `Create post: ${title}`

      await api.createOrUpdateFile(
        owner,
        repo,
        filePath,
        markdownContent,
        commitMessage,
        editMode ? fileSha : undefined,
      )

      toast({
        title: "Success",
        description: editMode ? "Post updated successfully" : "Post created successfully",
      })

      setTimeout(() => {
        router.push(`/posts/${slug}`)
      }, 1000)
    } catch (err) {
      console.error("Error saving post:", err)
      toast({
        title: "Error",
        description: "Failed to save post. Make sure the DevBlog repository has a blog or posts folder.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      if (item.type.indexOf("image") !== -1) {
        e.preventDefault()

        const blob = item.getAsFile()
        if (!blob) continue

        setUploadingImage(true)

        try {
          const reader = new FileReader()
          reader.onload = async (event) => {
            try {
              const base64Data = (event.target?.result as string)?.split(",")[1]
              if (!base64Data) throw new Error("Failed to read image")

              const api = new GitHubAPI()
              const timestamp = Date.now()
              const extension = blob.type.split("/")[1] || "png"
              const fileName = `paste-${timestamp}.${extension}`

              const imagePath = await api.uploadImage(owner, GitHubAPI.FIXED_REPO, fileName, base64Data)

              const textarea = e.target as HTMLTextAreaElement
              const cursorPosition = textarea.selectionStart
              const imageMarkdown = `![image](/${imagePath})`

              const newContent = content.slice(0, cursorPosition) + imageMarkdown + content.slice(cursorPosition)

              setContent(newContent)

              toast({
                title: "Image uploaded",
                description: "Image has been uploaded successfully",
              })

              setTimeout(() => {
                textarea.focus()
                const newPosition = cursorPosition + imageMarkdown.length
                textarea.setSelectionRange(newPosition, newPosition)
              }, 0)
            } catch (err) {
              console.error("Error uploading image:", err)
              toast({
                title: "Upload failed",
                description: "Failed to upload image. Please try again.",
                variant: "destructive",
              })
            } finally {
              setUploadingImage(false)
            }
          }

          reader.readAsDataURL(blob)
        } catch (err) {
          console.error("Error processing image:", err)
          setUploadingImage(false)
        }

        break
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Please sign in to create posts</h2>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />

      <main className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">{editMode ? "Edit Post" : "New Post"}</h2>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {saving ? "Saving..." : "Save Post"}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Editor Section */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  Repository:{" "}
                  <span className="font-medium text-foreground">
                    {owner}/{GitHubAPI.FIXED_REPO}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content (Markdown)</Label>
                  {uploadingImage && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin" />
                      Uploading image...
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Tip: You can paste images directly (Ctrl/Cmd+V)</p>
                <Textarea
                  id="content"
                  placeholder="Write your post in Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  className="min-h-[500px] font-mono text-sm"
                />
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="rounded-lg border bg-card p-6">
                    <h1 className="mb-4 text-3xl font-bold">{title || "Untitled"}</h1>
                    {content ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <p className="text-muted-foreground">Start writing to see preview...</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <div className="rounded-lg border bg-muted p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {createMarkdownWithFrontmatter(
                        title || "Untitled",
                        new Date().toISOString().split("T")[0],
                        content,
                      )}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
