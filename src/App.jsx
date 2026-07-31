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
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
      <nav className={`nav transition-all duration-300 ${scrolled ? 'shadow-lg backdrop-blur-md' : ''}`}>
        <div className="nav-inner">
          {/* Brand */}
          <NavLink 
            to="/" 
            className="nav-brand flex items-center gap-2 hover:scale-105 transition-transform"
            onClick={closeMobileMenu}
          >
            <Calendar className="h-6 w-6" />
            <span className="font-bold text-lg">EnteOnam</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
            <AuthModal />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto flex items-center gap-2">
            <AuthModal />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-white hover:bg-white/10 h-10 w-10"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-green-700 border-t border-green-600">
            <div className="container py-4">
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-gold text-foreground' 
                            : 'text-white hover:bg-white/10'
                        }`
                      }
                      onClick={closeMobileMenu}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{item.label}</span>
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
              <h3 className="text-lg font-semibold text-green">Onam Ashamsakal</h3>
              <Flower className="h-6 w-6 text-gold" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Celebrating Kerala's most beloved festival with community, tradition, and joy. 
              Find everything you need for a perfect Onam celebration.
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>Made with ❤️ for Kerala</span>
              <span>•</span>
              <span>Onam 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}