function Header({ title, subtitle, onMenuClick }) {

  return (
    <header className="app-header bg-white border-bottom px-4 py-3">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-primary d-lg-none"
            onClick={onMenuClick}
            aria-label="Menyuni ochish"
          >
            <i className="bi bi-list fs-5"></i>
          </button>
          <div>
            <h2 className="h4 mb-0 fw-semibold text-dark">{title}</h2>
            {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
