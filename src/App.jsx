import { useState, useEffect } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { Menu, X, Calendar, Store, MapPin, Camera, Flower, ChefHat, IndianRupee } from 'lucide-react'
import MapView from './components/map/MapView.jsx'
import StoresView from './components/stores/StoresView.jsx'
import PricesView from './components/stores/PricesView.jsx'
import SpotsView from './components/spots/SpotsView.jsx'
import FlowerView from './components/flower/FlowerView.jsx'
import SadyaPlanner from './components/sadya/SadyaPlanner.jsx'
import CountdownView from './components/countdown/CountdownView.jsx'
import AuthModal from './components/auth/AuthModal.jsx'
import { Button } from './components/ui/button'

const navigationItems = [
  { path: '/stores', label: 'Stores', icon: Store },
  { path: '/prices', label: 'Prices', icon: IndianRupee },
  { path: '/map', label: 'Map', icon: MapPin },
  { path: '/spots', label: 'Spots', icon: Camera },
  { path: '/flower', label: 'Flowers', icon: Flower },
  { path: '/sadya', label: 'Sadya', icon: ChefHat },
]

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-green-800/95 backdrop-blur-lg shadow-2xl border-b border-green-700/50' 
          : 'bg-green-800 shadow-lg'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand with Flower Accent */}
            <NavLink 
              to="/" 
              className="flex items-center gap-3 group"
              onClick={closeMobileMenu}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl group-hover:bg-gold/30 transition-all"></div>
                <div className="relative bg-gold/10 p-2 rounded-full group-hover:bg-gold/20 transition-all">
                  <Flower className="h-5 w-5 text-gold group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <span className="font-bold text-xl text-white group-hover:text-gold transition-colors">
                EnteOnam
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 group ${
                        isActive 
                          ? 'text-white bg-gold shadow-lg shadow-gold/20' 
                          : 'text-white hover:bg-white/10'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`h-4 w-4 transition-transform ${
                          isActive ? 'scale-110' : 'group-hover:scale-110'
                        }`} />
                        <span className="text-sm">{item.label}</span>
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 rounded-full"></div>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
              <div className="ml-2 pl-2 border-l border-white/20">
                <AuthModal />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <AuthModal />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="text-white hover:bg-white/10 hover:text-gold transition-all h-10 w-10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu with Smooth Animation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-green-900/50 backdrop-blur-md border-t border-green-700/50">
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-gold text-green-900 shadow-lg shadow-gold/20 scale-105' 
                            : 'text-white hover:bg-white/10 active:scale-95'
                        }`
                      }
                      onClick={closeMobileMenu}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`h-6 w-6 transition-transform ${
                            isActive ? 'scale-110' : ''
                          }`} />
                          <span className="text-xs font-semibold">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container section">
        <Routes>
          <Route path="/" element={<CountdownView />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/stores" element={<StoresView />} />
          <Route path="/prices" element={<PricesView />} />
          <Route path="/spots" element={<SpotsView />} />
          <Route path="/flower" element={<FlowerView />} />
          <Route path="/sadya" element={<SadyaPlanner />} />
          <Route path="/countdown" element={<CountdownView />} />
        </Routes>
      </main>

      {/* Footer with Onam Theme */}
      <footer className="bg-green/5 border-t border-gold/20 mt-16">
        <div className="container py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <Flower className="h-6 w-6 text-gold" />
              <h3 className="text-lg font-semibold text-green ml">ഓണാശംസകൾ</h3>
              <Flower className="h-6 w-6 text-gold" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Celebrating Kerala's most beloved festival with community, tradition, and joy. 
              Find everything you need for a perfect Onam celebration.
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>Made with ❤️ for Keralam from <a href="https://prasanthp.tech" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Prasanth P</a></span>
              <span>•</span>
              <span className="ml">ഓണം 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}