import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About ServiceStatusNow - Real-Time Service Status Monitoring',
  description: 'Learn about ServiceStatusNow, how we track service outages and status updates, and our mission to provide real-time information about website and app availability.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showSearch />

      <main className="flex-1">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              About ServiceStatusNow
            </h1>
            <p className="text-lg text-gray-600">
              Real-time service status monitoring and outage tracking
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ServiceStatusNow provides real-time monitoring and status updates for popular websites, apps, and online services. We help users quickly determine if a service is experiencing an outage or technical issues.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our platform aggregates user reports and analyzes trends to provide accurate, up-to-date information about service availability across hundreds of platforms including social media, banking, gaming, streaming services, and more.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Reports</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Users can submit reports when they experience issues with a service. These reports include the type of issue, optional descriptions, and location information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Real-Time Analysis</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our system analyzes report volumes in real-time, comparing current activity to baseline levels to detect potential outages and issues.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Status Updates</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Each service page displays current status, recent reports, trending charts, and geographic information to help users understand the scope of any issues.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Status Levels</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🟢</span>
                  <div>
                    <div className="font-medium text-gray-900">No Issues Reported</div>
                    <p className="text-sm text-gray-600">The service is operating normally with typical report volumes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🟡</span>
                  <div>
                    <div className="font-medium text-gray-900">Some Issues Reported</div>
                    <p className="text-sm text-gray-600">Report volume is elevated, indicating potential problems for some users.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <div className="font-medium text-gray-900">Major Outage Reported</div>
                    <p className="text-sm text-gray-600">Report volume is significantly elevated, indicating widespread issues.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚪</span>
                  <div>
                    <div className="font-medium text-gray-900">Not Enough Data</div>
                    <p className="text-sm text-gray-600">Insufficient reports to determine current status.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Coverage</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We monitor over 200 services across 10 categories:
              </p>
              <ul className="grid grid-cols-2 gap-2 text-gray-700">
                <li>• Social Media</li>
                <li>• Messaging Apps</li>
                <li>• Email Services</li>
                <li>• Banking</li>
                <li>• Payment Services</li>
                <li>• Streaming (Video & Music)</li>
                <li>• Gaming Platforms</li>
                <li>• Cloud & SaaS</li>
                <li>• E-Commerce</li>
                <li>• Internet & ISP</li>
              </ul>
            </section>

            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ServiceStatusNow aggregates user reports and public signals to provide status information. We are not affiliated with any of the companies or services listed on this site.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The information provided is based on user reports and should be used as an indicator of potential issues. For official status updates, please check the respective service's official channels.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
