'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { searchServices } from '@/lib/status'
import { Service } from '@/lib/supabase'

interface SearchBarProps {
  size?: 'sm' | 'lg'
  placeholder?: string
}

export function SearchBar({ size = 'lg', placeholder = 'Search for a service...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Service[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      const services = await searchServices(query)
      setResults(services)
      setIsOpen(services.length > 0)
      setIsLoading(false)
    }

    const timeoutId = setTimeout(search, 200)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (slug: string) => {
    setQuery('')
    setIsOpen(false)
    router.push(`/status/${slug}`)
  }

  const sizeClasses = size === 'lg' ? 'text-lg py-4 px-6' : 'text-base py-2.5 px-4'

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${sizeClasses} ${size === 'lg' ? 'pl-14' : 'pl-11'}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No services found</div>
          ) : (
            <ul>
              {results.map((service) => (
                <li key={service.id}>
                  <button
                    onClick={() => handleSelect(service.slug)}
                    className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {service.category}
                      {service.aliases.length > 0 && ` • ${service.aliases.join(', ')}`}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
