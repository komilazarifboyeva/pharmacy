import { useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/Dorilar/DeleteConfirmModal'
import DoriForm from '../components/Dorilar/DoriForm'
import DoriTable from '../components/Dorilar/DoriTable'
import { useApp } from '../context/AppContext'

function DorilarPage() {
  const { dorilar, loading, error, kategoriyalar, addDori, updateDori, deleteDori } = useApp()
  const [search, setSearch] = useState('')
  const [kategoriyaFilter, setKategoriyaFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selectedDori, setSelectedDori] = useState(null)
  const [formMode, setFormMode] = useState('add')

  const filteredDorilar = useMemo(() => {
    const query = search.trim().toLowerCase()

    return dorilar.filter((dori) => {
      const matchesSearch =
        !query ||
        dori.nomi.toLowerCase().includes(query) ||
        dori.kategoriya.toLowerCase().includes(query)

      const matchesCategory = !kategoriyaFilter || dori.kategoriya === kategoriyaFilter

      return matchesSearch && matchesCategory
    })
  }, [dorilar, search, kategoriyaFilter])

  const handleAddClick = () => {
    setSelectedDori(null)
    setFormMode('add')
    setShowForm(true)
  }

  const handleEdit = (dori) => {
    setSelectedDori(dori)
    setFormMode('edit')
    setShowForm(true)
  }

  const handleDelete = (dori) => {
    setSelectedDori(dori)
    setShowDelete(true)
  }

  const handleFormSubmit = (formData) => {
    if (formMode === 'edit' && selectedDori) {
      updateDori(selectedDori.id, formData)
      return
    }
    addDori(formData)
  }

  const handleDeleteConfirm = () => {
    if (selectedDori) {
      deleteDori(selectedDori.id)
    }
    setShowDelete(false)
    setSelectedDori(null)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yuklanmoqda...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 shadow-sm" role="alert">
        <i className="bi bi-exclamation-circle me-2"></i>
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-lg-5">
              <label htmlFor="search" className="form-label small text-muted mb-1">
                Qidiruv
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  id="search"
                  type="search"
                  className="form-control"
                  placeholder="Dori nomi yoki kategoriya..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-3">
              <label htmlFor="kategoriya" className="form-label small text-muted mb-1">
                Kategoriya
              </label>
              <select
                id="kategoriya"
                className="form-select"
                value={kategoriyaFilter}
                onChange={(event) => setKategoriyaFilter(event.target.value)}
              >
                <option value="">Barcha kategoriyalar</option>
                {kategoriyalar.map((kategoriya) => (
                  <option key={kategoriya} value={kategoriya}>
                    {kategoriya}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-4 d-flex gap-2 justify-content-lg-end">
              <button type="button" className="btn btn-primary" onClick={handleAddClick}>
                <i className="bi bi-plus-lg me-1"></i>
                Dori qo&apos;shish
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center py-3">
          <div>
            <h5 className="mb-0 fw-semibold">Dorilar ro&apos;yxati</h5>
            <small className="text-muted">
              Jami: {dorilar.length} ta | Ko&apos;rsatilmoqda: {filteredDorilar.length} ta
            </small>
          </div>
          <span className="badge text-bg-light text-dark border">
            <i className="bi bi-database me-1"></i>
            localStorage
          </span>
        </div>
        <div className="card-body p-0">
          <DoriTable dorilar={filteredDorilar} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      <DoriForm
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedDori}
        kategoriyalar={kategoriyalar}
        mode={formMode}
      />

      <DeleteConfirmModal
        show={showDelete}
        dori={selectedDori}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}

export default DorilarPage
