import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const pageTitles = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Dorixona umumiy ko\'rsatkichlari',
  },
  '/dorilar': {
    title: 'Dorilar',
    subtitle: 'Dorilar ro\'yxati va boshqaruvi',
  },
  '/savdo': {
    title: 'Savdo',
    subtitle: 'Yangi savdo qilish',
  },
  '/tarix': {
    title: 'Savdo tarixi',
    subtitle: 'Barcha savdolar ro\'yxati',
  },
  '/ogohlantirishlar': {
    title: 'Ogohlantirishlar',
    subtitle: 'Kam qolgan va muddati yaqin dorilar',
  },
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const currentPage = pageTitles[location.pathname] ?? pageTitles['/']

  return (
    <div className="app-layout d-flex min-vh-100">
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="app-main flex-grow-1 d-flex flex-column min-vh-100">
        <Header
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="app-content flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
