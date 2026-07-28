import { Routes, Route, NavLink } from 'react-router-dom'
import MapView from './components/map/MapView.jsx'
import StoresView from './components/stores/StoresView.jsx'
import PricesView from './components/stores/PricesView.jsx'
import SpotsView from './components/spots/SpotsView.jsx'
import FlowerView from './components/flower/FlowerView.jsx'
import SadyaPlanner from './components/sadya/SadyaPlanner.jsx'
import CountdownView from './components/countdown/CountdownView.jsx'
import AuthModal from './components/auth/AuthModal.jsx'

export default function App() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-inner">
          <NavLink to="/" className="nav-brand">EnteOnam</NavLink>
          <NavLink to="/stores" className="nav-link">Stores</NavLink>
          <NavLink to="/prices" className="nav-link">Prices</NavLink>
          <NavLink to="/map" className="nav-link">Map</NavLink>
          <NavLink to="/spots" className="nav-link">Spots</NavLink>
          <NavLink to="/flower" className="nav-link">Flowers</NavLink>
          <NavLink to="/sadya" className="nav-link">Sadya</NavLink>
          <AuthModal />
        </div>
      </nav>
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
    </div>
  )
}