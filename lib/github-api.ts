import { getStoredToken } from "./github-auth"

export interface BlogPost {
  title: string
  slug: string
  date: string
  content: string
  excerpt: string
  sha: string
}

export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  content?: string
  encoding?: string
}

export class GitHubAPI {
  private token: string | null
  private baseUrl = "https://api.github.com"
  public static readonly FIXED_REPO = "DevBlog"

  constructor() {
    this.token = getStoredToken()
  }

  private async request(endpoint: string, options: RequestInit = {}, allow404 = false) {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (allow404 && response.status === 404) {
        return null
      }
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserRepos() {
    return this.request("/user/repos?sort=updated&per_page=100")
  }

  async getAuthenticatedUser() {
    return this.request("/user")
  }

  async getRepoContents(owner: string, repo: string, path = "", allow404 = false) {
    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {}, allow404)
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const data: GitHubFile | null = await this.request(`/repos/${owner}/${repo}/contents/${path}`)
    if (data && data.content && data.encoding === "base64") {
      return atob(data.content.replace(/\n/g, ""))
    }
    return ""
  }

  async createOrUpdateFile(owner: string, repo: string, path: string, content: string, message: string, sha?: string) {
    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha,
      }),
    })
  }

  async deleteFile(owner: string, repo: string, path: string, sha: string, message: string) {
    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: "DELETE",
      body: JSON.stringify({
        message,
        sha,
      }),
    })
  }

  async createRepo(name: string, description: string, isPrivate = true) {
    return this.request("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      }),
    })
  }

  async checkRepoExists(owner: string, repo: string): Promise<boolean> {
    try {
      await this.request(`/repos/${owner}/${repo}`)
      return true
    } catch {
      return false
    }
  }

  async uploadImage(owner: string, repo: string, fileName: string, imageData: string): Promise<string> {
    const path = `images/${fileName}`
    const message = `Upload image: ${fileName}`

    await this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: imageData, // Already base64 encoded
      }),
    })

    return path
  }
}

export function parseMarkdownFrontmatter(content: string): {
  frontmatter: Record<string, string>
  body: string
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const frontmatterLines = match[1].split("\n")
  const frontmatter: Record<string, string> = {}

  frontmatterLines.forEach((line) => {
    const [key, ...valueParts] = line.split(":")
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts
        .join(":")
        .trim()
        .replace(/^["']|["']$/g, "")
    }
  })

  return {
    frontmatter,
    body: match[2].trim(),
  }
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function createMarkdownWithFrontmatter(title: string, date: string, content: string): string {
  return `---
title: ${title}
date: ${date}
---

${content}`
}
