"use client"

import { useEffect, useState } from "react"
import { GitHubLoginButton } from "@/components/github-login-button"
import { BlogHeader } from "@/components/blog-header"
import { Button } from "@/components/ui/button"
import { storeToken, storeUser, getStoredUser } from "@/lib/github-auth"
import { Github, FileText, Database, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [user, setUser] = useState(getStoredUser())

  useEffect(() => {
    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const userStr = params.get("user")

    if (token && userStr) {
      storeToken(token)
      const userData = JSON.parse(userStr)
      storeUser(userData)
      setUser(userData)
      // Clean URL
      window.history.replaceState({}, "", "/")
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />

      {/* Hero Section */}
      <main className="container py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-5xl font-bold tracking-tight">Write and publish your thoughts</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
            A minimal blogging platform powered by GitHub. Write in Markdown, store in your repository, and share with
            the world.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {!user ? (
              <GitHubLoginButton />
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/posts">View Posts</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/editor">New Post</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {user && (
          <div className="mx-auto mt-16 max-w-3xl rounded-lg border bg-card p-8">
            <h3 className="text-2xl font-semibold text-card-foreground">快速开始</h3>
            <p className="mt-2 text-sm text-muted-foreground">按照以下步骤开始使用您的博客系统</p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">访问文章列表</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    前往{" "}
                    <Link href="/posts" className="text-primary hover:underline">
                      文章列表
                    </Link>
                    ，系统会自动为您创建 <span className="font-mono text-xs">DevBlog</span>{" "}
                    私有仓库（如果尚未存在）。然后您可以选择初始化 <span className="font-mono text-xs">blog</span>{" "}
                    文件夹来存储文章。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">撰写您的第一篇文章</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    点击{" "}
                    <Link href="/editor" className="text-primary hover:underline">
                      新建文章
                    </Link>
                    ，使用 Markdown 编辑器开始写作。支持实时预览，所见即所得。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">发布并管理</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    保存后，文章会自动提交到您的 GitHub 仓库。在{" "}
                    <Link href="/posts" className="text-primary hover:underline">
                      文章列表
                    </Link>
                    中查看所有文章，点击任意文章可以阅读或编辑。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-md bg-muted p-4">
              <div className="text-muted-foreground">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                提示：系统会自动创建一个名为 DevBlog 的<strong>私有仓库</strong>来存储您的文章。所有数据都在您的 GitHub
                账户中，您完全拥有控制权。
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button asChild>
                <Link href="/editor">
                  开始写作
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Github className="size-6" />
            </div>
            <h3 className="text-lg font-semibold">GitHub Powered</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              All your posts are stored in your GitHub repository. You own your content.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-6" />
            </div>
            <h3 className="text-lg font-semibold">Markdown Support</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Write in Markdown with live preview. Simple, powerful, and familiar.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Database className="size-6" />
            </div>
            <h3 className="text-lg font-semibold">Zero Database</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Fully client-side application. No server, no database, just GitHub API.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
