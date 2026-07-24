import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: [
        '*',
        'GPTBot',
        'ChatGPT-User',
        'OAI-SearchBot',
        'ClaudeBot',
        'Claude-Web',
        'anthropic-ai',
        'PerplexityBot',
        'Google-Extended',
        'Applebot-Extended',
        'CCBot',
        'Bytespider'
      ],
      allow: '/',
      disallow: ['/dashboard', '/api', '/admin', '/r'],
    },
    sitemap: 'https://www.autodrop.in/sitemap.xml',
  }
}
