"use client"

import { useMemo } from "react"
import { marked } from "marked"
import { Card } from "@/components/ui/card"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    // Configure marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    })

    return marked(content)
  }, [content])

  return (
    <Card className="prose prose-neutral dark:prose-invert max-w-none p-8">
      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} style={{ maxWidth: "100%" }} />
    </Card>
  )
}
