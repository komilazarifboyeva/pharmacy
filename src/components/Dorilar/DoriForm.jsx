import { useEffect, useState } from 'react'

const defaultForm = {
  nomi: '',
  kategoriya: '',
  miqdor: '',
  narx: '',
}

function DoriForm({ show, onClose, onSubmit, initialData, kategoriyalar, mode = 'add' }) {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (show) {
      setForm(initialData ? { ...defaultForm, ...initialData } : defaultForm)
      setErrors({})
    }
  }, [show, initialData])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.nomi.trim()) nextErrors.nomi = 'Dori nomi kiritilishi shart'
    if (!form.kategoriya.trim()) nextErrors.kategoriya = 'Kategoriya kiritilishi shart'
    if (form.miqdor === '' || Number(form.miqdor) < 0) nextErrors.miqdor = 'Miqdor 0 dan katta bo\'lishi kerak'
    if (form.narx === '' || Number(form.narx) <= 0) nextErrors.narx = 'Narx 0 dan katta bo\'lishi kerak'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    onSubmit({
      nomi: form.nomi.trim(),
      kategoriya: form.kategoriya.trim(),
      miqdor: Number(form.miqdor),
      narx: Number(form.narx),
    })
    onClose()
  }

  if (!show) return null

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold">
                {mode === 'edit' ? 'Dorini tahrirlash' : "Yangi dori qo'shish"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Yopish"></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="nomi" className="form-label">Dori nomi *</label>
                    <input
                      id="nomi"
                      name="nomi"
                      type="text"
                      className={`form-control ${errors.nomi ? 'is-invalid' : ''}`}
                      value={form.nomi}
                      onChange={handleChange}
                      placeholder="Masalan: Paracetamol 500mg"
                    />
                    {errors.nomi && <div className="invalid-feedback">{errors.nomi}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="kategoriya" className="form-label">Kategoriya *</label>
                    <input
                      id="kategoriya"
                      name="kategoriya"
                      type="text"
                      className={`form-control ${errors.kategoriya ? 'is-invalid' : ''}`}
                      value={form.kategoriya}
                      onChange={handleChange}
                      list="kategoriya-list"
                      placeholder="Masalan: Antibiotik"
                    />
                    <datalist id="kategoriya-list">
                      {kategoriyalar.map((kategoriya) => (
                        <option key={kategoriya} value={kategoriya} />
                      ))}
                    </datalist>
                    {errors.kategoriya && <div className="invalid-feedback">{errors.kategoriya}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="miqdor" className="form-label">Miqdor *</label>
                    <input
                      id="miqdor"
                      name="miqdor"
                      type="number"
                      min="0"
                      className={`form-control ${errors.miqdor ? 'is-invalid' : ''}`}
                      value={form.miqdor}
                      onChange={handleChange}
                    />
                    {errors.miqdor && <div className="invalid-feedback">{errors.miqdor}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="narx" className="form-label">Narx (so'm) *</label>
                    <input
                      id="narx"
                      name="narx"
                      type="number"
                      min="1"
                      className={`form-control ${errors.narx ? 'is-invalid' : ''}`}
                      value={form.narx}
                      onChange={handleChange}
                    />
                    {errors.narx && <div className="invalid-feedback">{errors.narx}</div>}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={onClose}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  {mode === 'edit' ? 'Saqlash' : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  )
}

export default DoriForm
