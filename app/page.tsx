import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SearchBar } from '@/components/search-bar'
import { ServiceCard } from '@/components/service-card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ServiceStatusNow - Check if a website or app is down right now',
  description: 'Live outage reports and service status updates. Check real-time status for popular websites and apps including Twitter, Facebook, Gmail, PlayStation, Netflix and more.',
  openGraph: {
    title: 'ServiceStatusNow - Live Service Status & Outage Reports',
    description: 'Check real-time outage reports and status updates for popular websites and apps.',
    type: 'website',
  },
}

export const revalidate = 60

// Fetch live status data from our API
async function getLiveStatuses() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicestatusnow.vercel.app'
    const response = await fetch(`${baseUrl}/api/status/live`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch live statuses:', response.status)
      return { services: [] }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching live statuses:', error)
    return { services: [] }
  }
}

// Get services with issues (not operational)
function getTrendingServices(services: any[], limit: number = 12) {
  return services
    .filter(s => s.status !== 'operational' && s.status !== 'unknown')
    .slice(0, limit)
}

// Get most popular/checked services
function getMostCheckedServices(services: any[], limit: number = 12) {
  return services.slice(0, limit)
}

export default async function Home() {
  const liveData = await getLiveStatuses()
  const allServices = liveData.services || []
  
  const mostChecked = getMostCheckedServices(allServices, 12)
  const trending = getTrendingServices(allServices, 12)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ServiceStatusNow',
    url: 'https://servicestatusnow.com',
    description: 'Live outage reports and service status updates for popular websites and apps.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://servicestatusnow.com/status/{search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        :root {
          --accent: #3b82f6;
          --accent-glow: rgba(59, 130, 246, 0.5);
          --bg-dark: #0a0a0f;
          --bg-card: #12121a;
          --font-main: 'Poppins', sans-serif;
        }
        
        /* Fade in up animation for hero content */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .fade-in-up-delay-1 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
        }
        
        .fade-in-up-delay-2 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
        }
        
        .fade-in-up-delay-3 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
        }
        
        /* Pulse glow */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow);
          }
          50% {
            box-shadow: 0 0 30px var(--accent-glow), 0 0 60px var(--accent-glow), 0 0 80px var(--accent-glow);
          }
        }
        
        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        /* Radar sweep */
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .radar-sweep {
          animation: radar-sweep 4s linear infinite;
        }
        
        /* Radar rings expanding */
        @keyframes radar-ping {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .radar-ping {
          animation: radar-ping 3s ease-out infinite;
        }
        
        .radar-ping-delay-1 { animation-delay: 1s; }
        .radar-ping-delay-2 { animation-delay: 2s; }
        
        /* Status dot pulse */
        @keyframes dot-pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
        
        .dot-pulse {
          animation: dot-pulse 2s ease-in-out infinite;
        }
        
        /* Floating particles */
        @keyframes float-up {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }
        
        .particle {
          animation: float-up var(--duration) linear infinite;
          animation-delay: var(--delay);
        }
        
        /* Text shimmer */
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #3b82f6 0%,
            #60a5fa 25%,
            #93c5fd 50%,
            #60a5fa 75%,
            #3b82f6 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: text-shimmer 3s linear infinite;
        }
        
        /* Search bar glow */
        @keyframes border-glow {
          0%, 100% { 
            box-shadow: 0 0 0 1px var(--accent), 0 0 20px var(--accent-glow);
          }
          50% { 
            box-shadow: 0 0 0 2px var(--accent), 0 0 30px var(--accent-glow), 0 0 40px var(--accent-glow);
          }
        }
        
        .search-glow {
          animation: border-glow 2s ease-in-out infinite;
        }
        
        /* Gradient flow */
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .gradient-flow {
          background-size: 200% 200%;
          animation: gradient-flow 5s ease infinite;
        }
        
        /* Network node pulse */
        @keyframes network-pulse {
          0%, 100% {
            opacity: 1;
            r: 4;
          }
          50% {
            opacity: 0.6;
            r: 6;
          }
        }
        
        .network-node {
          animation: network-pulse 3s ease-in-out infinite;
        }
        
        /* Data packet travel */
        @keyframes data-travel {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        
        .data-packet {
          animation: data-travel var(--travel-time, 5s) linear infinite;
          animation-delay: var(--travel-delay, 0s);
        }
        
        /* Connection line pulse */
        @keyframes line-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        .connection-line line {
          animation: line-pulse 3s ease-in-out infinite;
        }
      ` }} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      <main className="flex-grow relative">
        {/* Hero section */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)' }}>
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 bg-blue-400/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  '--duration': `${15 + Math.random() * 15}s`,
                  '--delay': `${Math.random() * 10}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative">
            {/* Radar animation container */}
            <div className="absolute top-12 right-12 w-[200px] h-[200px] opacity-20 pointer-events-none hidden lg:block">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full" />
                <div className="absolute inset-4 border border-blue-500/20 rounded-full radar-ping" />
                <div className="absolute inset-4 border border-blue-500/20 rounded-full radar-ping radar-ping-delay-1" />
                <div className="absolute inset-4 border border-blue-500/20 rounded-full radar-ping radar-ping-delay-2" />
                
                <svg className="absolute inset-0 w-full h-full radar-sweep" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="radarGradient" x1="50%" y1="50%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z"
                    fill="url(#radarGradient)"
                  />
                </svg>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full pulse-glow" />
                </div>
              </div>
            </div>
            
            <div className="text-center relative">
              <h1 
                className="fade-in-up text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <span className="shimmer-text block mb-2">
                  Is it down?
                </span>
                <span className="text-white">
                  Check any service status
                </span>
              </h1>
              
              <p 
                className="fade-in-up-delay-1 text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Real-time outage detection for 200+ websites and apps. Know instantly if the problem is on your end or theirs.
              </p>
              
              <div className="fade-in-up-delay-2 max-w-2xl mx-auto mb-12">
                <SearchBar />
              </div>
              
              <div className="fade-in-up-delay-3 inline-flex items-center gap-8 px-6 py-4 bg-[#12121a]/60 backdrop-blur-sm border border-blue-500/10 rounded-2xl">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 8px #22c55e', animationDelay: `${i}s` }} />
                      <span className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Discord: Operational</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 8px #22c55e', animationDelay: `${i + 1.5}s` }} />
                      <span className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Google: Operational</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 8px #22c55e', animationDelay: `${i + 2.5}s` }} />
                      <span className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Spotify: Operational</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Network Mesh at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[180px] overflow-hidden pointer-events-none">
            <svg 
              className="absolute bottom-0 w-full h-full" 
              viewBox="0 0 1200 180" 
              preserveAspectRatio="xMidYMax slice"
            >
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <g className="connection-line">
                <line x1="50" y1="150" x2="200" y2="130" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
                <line x1="200" y1="130" x2="350" y2="145" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
                <line x1="350" y1="145" x2="500" y2="125" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
                <line x1="500" y1="125" x2="650" y2="140" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
                <line x1="650" y1="140" x2="800" y2="120" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
                <line x1="800" y1="120" x2="950" y2="135" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
                <line x1="950" y1="135" x2="1100" y2="125" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
                
                <line x1="200" y1="130" x2="350" y2="165" stroke="#3b82f6" strokeWidth="1" opacity="0.15" />
                <line x1="350" y1="145" x2="500" y2="170" stroke="#3b82f6" strokeWidth="1" opacity="0.15" />
                <line x1="500" y1="125" x2="650" y2="160" stroke="#3b82f6" strokeWidth="1" opacity="0.15" />
                <line x1="650" y1="140" x2="800" y2="165" stroke="#3b82f6" strokeWidth="1" opacity="0.15" />
                <line x1="800" y1="120" x2="950" y2="155" stroke="#3b82f6" strokeWidth="1" opacity="0.15" />
                
                <line x1="100" y1="170" x2="250" y2="165" stroke="#3b82f6" strokeWidth="1" opacity="0.1" />
                <line x1="250" y1="165" x2="400" y2="175" stroke="#3b82f6" strokeWidth="1" opacity="0.1" />
                <line x1="400" y1="175" x2="550" y2="165" stroke="#3b82f6" strokeWidth="1" opacity="0.1" />
                <line x1="550" y1="165" x2="700" y2="175" stroke="#3b82f6" strokeWidth="1" opacity="0.1" />
                <line x1="700" y1="175" x2="850" y2="165" stroke="#3b82f6" strokeWidth="1" opacity="0.1" />
                <line x1="850" y1="165" x2="1000" y2="175" stroke="#3b82f6" strokeWidth="1" opacity="0.1" />
              </g>
              
              <g filter="url(#glow)">
                <circle className="network-node" cx="50" cy="150" r="4" fill="#3b82f6" style={{ animationDelay: '0s' }} />
                <circle className="network-node" cx="200" cy="130" r="5" fill="#22c55e" style={{ animationDelay: '0.3s' }} />
                <circle className="network-node" cx="350" cy="145" r="4" fill="#3b82f6" style={{ animationDelay: '0.6s' }} />
                <circle className="network-node" cx="500" cy="125" r="6" fill="#22c55e" style={{ animationDelay: '0.9s' }} />
                <circle className="network-node" cx="650" cy="140" r="4" fill="#eab308" style={{ animationDelay: '1.2s' }} />
                <circle className="network-node" cx="800" cy="120" r="5" fill="#22c55e" style={{ animationDelay: '1.5s' }} />
                <circle className="network-node" cx="950" cy="135" r="4" fill="#3b82f6" style={{ animationDelay: '1.8s' }} />
                <circle className="network-node" cx="1100" cy="125" r="5" fill="#22c55e" style={{ animationDelay: '2.1s' }} />
                <circle className="network-node" cx="1150" cy="145" r="4" fill="#3b82f6" style={{ animationDelay: '2.4s' }} />
              </g>
              
              <g filter="url(#glow)" opacity="0.6">
                <circle className="network-node" cx="100" cy="170" r="3" fill="#3b82f6" style={{ animationDelay: '0.2s' }} />
                <circle className="network-node" cx="250" cy="165" r="3" fill="#3b82f6" style={{ animationDelay: '0.5s' }} />
                <circle className="network-node" cx="400" cy="175" r="3" fill="#22c55e" style={{ animationDelay: '0.8s' }} />
                <circle className="network-node" cx="550" cy="165" r="3" fill="#3b82f6" style={{ animationDelay: '1.1s' }} />
                <circle className="network-node" cx="700" cy="175" r="3" fill="#22c55e" style={{ animationDelay: '1.4s' }} />
                <circle className="network-node" cx="850" cy="165" r="4" fill="#ef4444" style={{ animationDelay: '1.7s' }} />
                <circle className="network-node" cx="1000" cy="175" r="3" fill="#3b82f6" style={{ animationDelay: '2s' }} />
              </g>
              
              <circle 
                className="data-packet" 
                r="3" 
                fill="#60a5fa"
                style={{ 
                  offsetPath: 'path("M0,140 Q300,100 600,130 Q900,160 1200,120")',
                  '--travel-time': '6s',
                  '--travel-delay': '0s'
                } as React.CSSProperties}
              />
              <circle 
                className="data-packet" 
                r="2" 
                fill="#60a5fa"
                style={{ 
                  offsetPath: 'path("M0,160 Q400,120 800,150 Q1000,170 1200,140")',
                  '--travel-time': '8s',
                  '--travel-delay': '2s'
                } as React.CSSProperties}
              />
              <circle 
                className="data-packet" 
                r="2.5" 
                fill="#60a5fa"
                style={{ 
                  offsetPath: 'path("M1200,130 Q900,100 600,140 Q300,170 0,150")',
                  '--travel-time': '7s',
                  '--travel-delay': '4s'
                } as React.CSSProperties}
              />
            </svg>
            
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>
        
        {/* Trust section */}
        <div className="bg-[#0a0a0f] relative z-10 -mt-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#12121a] border border-blue-500/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/5 blur-[80px] rounded-full" />
              
              <h2 
                className="text-lg font-semibold text-blue-400 mb-3 relative"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Real-time outage radar — not guesswork
              </h2>
              <p 
                className="text-gray-400 relative leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                We detect service issues using a combination of live connectivity checks, activity patterns, and user reports. This helps surface problems as they happen — often before traditional outage trackers catch them.
              </p>
              <p 
                className="mt-3 text-sm text-gray-500 relative"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Status is based on aggregated signals and may vary by location.
              </p>
            </div>
          </div>
        </div>

        {/* Services sections */}
        <div className="bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <section className="mb-16">
              <h2 
                className="text-2xl sm:text-3xl font-semibold text-white mb-8"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Most checked right now
              </h2>
              {mostChecked.length === 0 ? (
                <p className="text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Loading services...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mostChecked.map((service) => (
                    <ServiceCard key={service.slug} service={service} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 
                className="text-2xl sm:text-3xl font-semibold text-white mb-8"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Trending issues
              </h2>
              {trending.length === 0 ? (
                <div className="text-center py-12 bg-[#12121a] rounded-xl border border-blue-500/10">
                  <p className="text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>No trending issues at the moment</p>
                  <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>All systems appear to be running smoothly</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trending.map((service) => (
                    <ServiceCard key={service.slug} service={service} showTrend={true} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
