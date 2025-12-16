import Link from 'next/link'
import { SearchBar } from './search-bar'
import { Activity } from 'lucide-react'

interface HeaderProps {
  showSearch?: boolean
}

export function Header({ showSearch = false }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <Activity className="h-6 w-6 text-blue-600" />
              ServiceStatusNow
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Home
              </Link>
              <Link href="/popular" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Popular
              </Link>
              <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Categories
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                About
              </Link>
            </nav>
          </div>
          {showSearch && (
            <div className="hidden lg:block w-full max-w-md ml-8">
              <SearchBar size="sm" placeholder="Search services..." />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
