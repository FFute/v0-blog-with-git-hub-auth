# DevBlog - GitHub Powered Blogging Platform

A fully client-side blogging platform that uses GitHub for authentication and content storage. Write in Markdown, store in your repository, and share with the world.

## Features

- **GitHub Authentication**: Sign in with your GitHub account
- **GitHub Storage**: All posts stored as Markdown files in your GitHub repository
- **Markdown Editor**: Write posts with live preview
- **Zero Database**: Fully client-side, no backend required
- **Version Control**: Your content is version controlled through Git
- **Full Ownership**: You own all your content in your own repository

## Getting Started

1. **Sign in with GitHub**: Click the "Sign in with GitHub" button on the homepage
2. **Configure Repository**: Go to Settings to initialize a blog folder in your repository
3. **Create Your First Post**: Use the editor to write your first post in Markdown
4. **View Your Posts**: Browse all your posts in the Posts page

## Environment Variables

To enable GitHub OAuth, you need to set up a GitHub OAuth App:

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: Your application URL
   - Authorization callback URL: `{your-url}/api/auth/callback`
3. Add these environment variables to your Vercel project:
   - `NEXT_PUBLIC_GITHUB_CLIENT_ID`: Your OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: Your OAuth App Client Secret

## Tech Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first styling
- **shadcn/ui**: Beautiful UI components
- **GitHub API**: Content storage and authentication
- **Marked**: Markdown parsing and rendering

## File Structure

```
├── app/
│   ├── page.tsx           # Homepage
│   ├── posts/            # Blog posts listing and reading
│   ├── editor/           # Markdown editor
│   ├── settings/         # Repository configuration
│   └── api/auth/         # GitHub OAuth callback
├── components/
│   ├── blog-header.tsx   # Site header
│   ├── blog-post-card.tsx
│   ├── markdown-renderer.tsx
│   ├── github-login-button.tsx
│   └── user-menu.tsx
└── lib/
    ├── github-auth.ts    # GitHub authentication utilities
    └── github-api.ts     # GitHub API wrapper
```

## How It Works

1. **Authentication**: Users authenticate via GitHub OAuth, tokens stored in localStorage
2. **Repository Selection**: Users select which repository to store their posts
3. **Folder Structure**: Posts are stored in a `posts` or `blog` folder as Markdown files
4. **Frontmatter**: Each post has YAML frontmatter with title and date
5. **GitHub API**: All content operations use GitHub's REST API
6. **Client-Side**: Everything runs in the browser, no server database needed

## Post Format

Posts are Markdown files with YAML frontmatter:

```markdown
---
title: My First Post
date: 2025-01-01
---

Your post content here in **Markdown** format...
```

## License

MIT
