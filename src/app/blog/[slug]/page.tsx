import Link from 'next/link'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  category: string
  author: string
  featured_image: string
  published_at: string
  reading_time: number
  tags: string[]
  view_count?: number
}

interface PageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!post) notFound()

  // Increment view count
  await supabase
    .from('blog_posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', post.id)

  // Get related posts
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, featured_image, reading_time')
    .eq('category', post.category)
    .eq('is_published', true)
    .neq('id', post.id)
    .limit(3)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-2xl font-bold hover:text-green-100 transition-colors">
            🏹 Archery Ranges Canada
          </Link>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-green-600">Blog</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{post.title}</span>
          </div>
        </div>
      </nav>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {post.featured_image && (
          <div className="relative h-96 mb-8 rounded-2xl overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="mb-8">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold uppercase">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center space-x-6 text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">✍️ {post.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📅 {new Date(post.published_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⏱️ {post.reading_time} min read</span>
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  {related.featured_image && (
                    <div className="relative h-40 bg-gray-200">
                      <img
                        src={related.featured_image}
                        alt={related.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {related.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Archery Ranges Canada. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export async function generateStaticParams() {
  const supabase = createStaticClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('is_published', true)

  if (!posts) return []

  return posts.map((post) => ({
    slug: post.slug,
  }))
}