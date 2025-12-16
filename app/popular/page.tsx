'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ServiceCard } from '@/components/service-card'
import { supabase, ServiceWithStatus } from '@/lib/supabase'
import { getServicesWithStatus } from '@/lib/status'
import { Search } from 'lucide-react'

export default function PopularPage() {
  const [services, setServices] = useState<ServiceWithStatus[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceWithStatus[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('total_checks', { ascending: false })
        .limit(100)

      if (data) {
        const servicesWithStatus = await getServicesWithStatus(data.map((s) => s.id))
        setServices(servicesWithStatus)
        setFilteredServices(servicesWithStatus)
      }
      setIsLoading(false)
    }

    loadServices()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredServices(services)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.aliases.some((alias) => alias.toLowerCase().includes(query))
    )
    setFilteredServices(filtered)
  }, [searchQuery, services])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showSearch />

      <main className="flex-1">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Popular Services
            </h1>
            <p className="text-gray-600">
              Top 100 most checked services on ServiceStatusNow
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter services..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No services found matching your search</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
