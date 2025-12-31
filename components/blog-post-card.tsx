import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import type { BlogPost } from "@/lib/github-api"

interface BlogPostCardProps {
  post: BlogPost
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`}>
      <Card className="transition-colors hover:bg-accent">
        <CardHeader>
          <CardTitle className="text-balance">{post.title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="size-4" />
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-pretty">{post.excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
