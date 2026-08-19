import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import { AppProvider } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import DorilarPage from './pages/DorilarPage'
import SavdoPage from './pages/SavdoPage'
import TarixPage from './pages/TarixPage'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dorilar" element={<DorilarPage />} />
            <Route path="savdo" element={<SavdoPage />} />
            <Route path="tarix" element={<TarixPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
