"use client"

import { useMemo } from "react"
import { marked } from "marked"
import { Card } from "@/components/ui/card"

interface MarkdownRendererProps {
  content: string
  owner?: string
  repo?: string
}

export function MarkdownRenderer({ content, owner, repo }: MarkdownRendererProps) {
  const html = useMemo(() => {
    const renderer = new marked.Renderer()

    renderer.image = ({ href, title, text }) => {
      // Convert relative GitHub paths to raw URLs
      let imageUrl = href || ""
      if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("/") && owner && repo) {
        imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main${imageUrl}`
      }

      const titleAttr = title ? ` title="${title}"` : ""
      return `<img src="${imageUrl}" alt="${text || ""}"${titleAttr} />`
    }

    marked.setOptions({
      breaks: true,
      gfm: true,
      renderer,
    })

    return marked(content)
  }, [content, owner, repo])

  return (
    <Card className="prose prose-neutral dark:prose-invert max-w-none p-8">
      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} style={{ maxWidth: "100%" }} />
    </Card>
  )
}
