import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CATEGORIES } from '@/lib/status'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Service Categories | ServiceStatusNow',
  description: 'Browse services by category including social media, banking, gaming, streaming, cloud services and more.',
}

export const revalidate = 300

export default async function CategoriesPage() {
  const categoryCounts = await Promise.all(
    CATEGORIES.map(async (category) => {
      const { count } = await supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('category', category.name)

      return {
        ...category,
        count: count || 0,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showSearch />

      <main className="flex-1">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Service Categories
            </h1>
            <p className="text-gray-600">
              Browse services by category to find status updates for your favorite platforms
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryCounts.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="block p-6 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {category.count} {category.count === 1 ? 'service' : 'services'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
