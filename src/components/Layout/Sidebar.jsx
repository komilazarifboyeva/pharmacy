import { NavLink } from 'react-router-dom'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/dorilar', label: 'Dorilar', icon: 'bi-capsule' },
  { path: '/savdo', label: 'Savdo', icon: 'bi-cart3' },
  { path: '/tarix', label: 'Savdo tarixi', icon: 'bi-clock-history' },
]

function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar bg-primary text-white d-flex flex-column">
      <div className="sidebar-brand px-4 py-4 border-bottom border-white border-opacity-25">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-heart-pulse-fill fs-3"></i>
          <div>
            <h1 className="h5 mb-0 fw-bold">Pharmacy CRM</h1>
            <small className="text-white-50">Dorixona tizimi</small>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav flex-grow-1 px-3 py-4">
        <ul className="nav nav-pills flex-column gap-1">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-white-50'}`
                }
                onClick={onNavigate}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>      
    </aside>
  )
}

export default Sidebar
