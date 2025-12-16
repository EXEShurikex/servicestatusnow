export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-600 text-center">
          We aggregate user reports and public signals. Not affiliated with any company.
        </p>
        <p className="text-xs text-gray-500 text-center mt-2">
          © {new Date().getFullYear()} ServiceStatusNow. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
