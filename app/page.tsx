import { fetchLiveStatuses } from "@/lib/live-status";
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SearchBar } from '@/components/search-bar'
import { ServiceCard } from '@/components/service-card'
import { getMostCheckedServices, getTrendingServices } from '@/lib/status'
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

export default async function Home() {
  const [mostChecked, trending] = await Promise.all([
    getMostCheckedServices(12),
    getTrendingServices(12),
  ])

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
            box-shadow: 0 0 0 1px var(--accent), 0 0 30px var(--accent-glow), 0 0 50px var(--accent-glow);
          }
        }
        
        .search-glow {
          animation: border-glow 3s ease-in-out infinite;
        }
        
        /* Grid background */
        @keyframes grid-fade {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        
        .grid-bg {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: grid-fade 8s ease-in-out infinite;
        }
        
        /* Gradient orb */
        @keyframes gradient-shift {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        .gradient-orb {
          animation: gradient-shift 10s ease-in-out infinite;
        }
        
        /* Node appear */
        @keyframes node-appear {
          0% { 
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
          }
          100% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .node-appear {
          animation: node-appear 0.5s ease-out forwards;
        }
        
        /* Ticker scroll */
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .ticker-scroll {
          animation: ticker-scroll 30s linear infinite;
        }
        
        /* Network node pulse */
        @keyframes network-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        
        .network-node {
          animation: network-pulse 3s ease-in-out infinite;
        }
        
        /* Data packet travel */
        @keyframes packet-travel {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }
        
        .data-packet {
          offset-rotate: 0deg;
          animation: packet-travel var(--travel-time, 4s) linear infinite;
          animation-delay: var(--travel-delay, 0s);
        }
        
        /* Connection line pulse */
        @keyframes line-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
        
        .connection-line {
          animation: line-pulse 4s ease-in-out infinite;
        }
      `}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden min-h-[650px] sm:min-h-[750px] flex items-center bg-[#0a0a0f]">
          
          {/* Grid background */}
          <div className="absolute inset-0 grid-bg" />
          
          {/* Gradient orbs */}
          <div className="gradient-orb absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="gradient-orb absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[100px]" style={{ animationDelay: '-5s' }} />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 bg-blue-400/60 rounded-full"
                style={{
                  left: `${5 + i * 6}%`,
                  '--duration': `${15 + Math.random() * 20}s`,
                  '--delay': `${Math.random() * 10}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
          
          {/* Radar element */}
          <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] opacity-30 pointer-events-none hidden lg:block">
            <div className="absolute inset-0 rounded-full border border-blue-500/20" />
            <div className="absolute inset-[15%] rounded-full border border-blue-500/30" />
            <div className="absolute inset-[30%] rounded-full border border-blue-500/40" />
            <div className="absolute inset-[45%] rounded-full border border-blue-500/50" />
            
            <div className="absolute inset-[48%] rounded-full bg-blue-500" style={{ boxShadow: '0 0 20px #3b82f6, 0 0 40px #3b82f6' }} />
            
            <div className="radar-ping absolute inset-[45%] rounded-full border-2 border-blue-400" />
            <div className="radar-ping radar-ping-delay-1 absolute inset-[45%] rounded-full border-2 border-blue-400" />
            <div className="radar-ping radar-ping-delay-2 absolute inset-[45%] rounded-full border-2 border-blue-400" />
            
            <div className="radar-sweep absolute inset-0" style={{ transformOrigin: 'center center' }}>
              <div className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left bg-gradient-to-r from-blue-400 to-transparent" />
            </div>
            
            <div className="node-appear absolute top-[20%] left-[60%] w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '1s', boxShadow: '0 0 10px #22c55e' }} />
            <div className="node-appear absolute top-[40%] left-[25%] w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '1.5s', boxShadow: '0 0 10px #22c55e' }} />
            <div className="node-appear absolute top-[70%] left-[55%] w-2 h-2 bg-yellow-500 rounded-full" style={{ animationDelay: '2s', boxShadow: '0 0 10px #eab308' }} />
            <div className="node-appear absolute top-[55%] left-[75%] w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '2.5s', boxShadow: '0 0 10px #22c55e' }} />
          </div>
          
          {/* Main content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 lg:text-left lg:ml-[10%]">
            
            {/* HEADLINE - Clean, bold, readable */}
            <h1 
              className="fade-in-up text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Check If A Website Or App Is{' '}
              <span className="shimmer-text">Down Right Now</span>
            </h1>
            
            {/* SUBTITLE */}
            <p 
              className="fade-in-up-delay-1 text-lg sm:text-xl text-gray-400 max-w-xl mb-10 lg:mx-0 mx-auto"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}
            >
              Real-time outage detection & live status updates for thousands of services worldwide.
            </p>
            
            {/* Search bar */}
            <div className="fade-in-up-delay-2 max-w-xl mx-auto lg:mx-0 relative">
              <div className="search-glow absolute -inset-[1px] rounded-xl bg-blue-500/20" />
              <div className="relative bg-[#12121a] rounded-xl border border-blue-500/30">
                <SearchBar size="lg" placeholder="Search for a service (e.g., Twitter, Gmail, Netflix)..." />
              </div>
            </div>
            
            {/* Status ticker */}
            <div className="fade-in-up-delay-3 mt-8 overflow-hidden max-w-xl mx-auto lg:mx-0">
              <div className="ticker-scroll flex gap-8 whitespace-nowrap" style={{ width: 'max-content' }}>
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-8">
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 8px #22c55e' }} />
                      <span className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Netflix: Operational</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-yellow-500 rounded-full" style={{ boxShadow: '0 0 8px #eab308', animationDelay: '0.5s' }} />
                      <span className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Discord: Degraded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 8px #22c55e', animationDelay: '1s' }} />
                      <span className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>AWS: Operational</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-red-500 rounded-full" style={{ boxShadow: '0 0 8px #ef4444', animationDelay: '1.5s' }} />
                      <span className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Xbox Live: Outage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 8px #22c55e', animationDelay: '2s' }} />
                      <span className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Google: Operational</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dot-pulse w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 8px #22c55e', animationDelay: '2.5s' }} />
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
                    <ServiceCard key={service.id} service={service} />
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
                    <ServiceCard key={service.id} service={service} showTrend={true} />
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
