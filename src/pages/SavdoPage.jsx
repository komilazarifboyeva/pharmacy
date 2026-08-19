import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatNarx } from '../utils/format'

function SavdoPage() {
  // Context'dan dorilar ro'yxati, savdo funksiyalari va holat o'zgaruvchilari
  const { dorilar, loading, error, updateDori, addSavdo } = useApp()

  // Qidiruv input qiymati
  const [search, setSearch] = useState('')

  // Foydalanuvchi tanlagan dori obyekti (null = hali tanlanmagan)
  const [selectedDori, setSelectedDori] = useState(null)

  // Sotilishi kerak bo'lgan miqdor (string — input bilan mos kelishi uchun)
  const [miqdor, setMiqdor] = useState('')

  // Miqdor validatsiya xato xabari (bo'sh = xato yo'q)
  const [miqdorError, setMiqdorError] = useState('')

  // Muvaffaqiyatli savdo xabari (bo'sh = ko'rsatilmaydi)
  const [successMsg, setSuccessMsg] = useState('')

  /**
   * Qidiruv so'zi va zaxira holatiga qarab dorilar ro'yxatini filterlaydi.
   * Faqat miqdor > 0 bo'lgan dorilar ko'rsatiladi (zaxirasi bor).
   * Dori nomi yoki kategoriya bo'yicha qidiradi.
   */
  const filteredDorilar = useMemo(() => {
    const query = search.trim().toLowerCase()
    return dorilar.filter((dori) => {
      const hasStock = dori.miqdor > 0
      const matchesSearch =
        !query ||
        dori.nomi.toLowerCase().includes(query) ||
        dori.kategoriya.toLowerCase().includes(query)
      return hasStock && matchesSearch
    })
  }, [dorilar, search])

  /**
   * Tanlangan dori va kiritilgan miqdor asosida jami narxni hisoblaydi.
   * Agar dori tanlanmagan yoki miqdor noto'g'ri bo'lsa 0 qaytaradi.
   */
  const jami = useMemo(() => {
    const count = Number(miqdor)
    if (!selectedDori || !count || count <= 0) return 0
    return selectedDori.narx * count
  }, [selectedDori, miqdor])

  /**
   * Foydalanuvchi dropdown'dan dori tanlaganda chaqiriladi.
   * Tanlangan dorini state'ga saqlaydi, miqdor va xatolarni reset qiladi.
   * Search inputga tanlangan dorining nomini yozadi.
   *
   * @param {Object} dori - Tanlangan dori obyekti
   */
  const handleDoriSelect = (dori) => {
    setSelectedDori(dori)
    setMiqdor('')
    setMiqdorError('')
    setSuccessMsg('')
    setSearch(dori.nomi)
  }

  /**
   * Qidiruv input o'zgarganda chaqiriladi.
   * Yangi qidiruv boshlanganida avvalgi tanlangan dorini bekor qiladi
   * va bog'liq state'larni tozalaydi.
   *
   * @param {React.ChangeEvent} e - Input change eventi
   */
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setSelectedDori(null)
    setMiqdor('')
    setMiqdorError('')
  }

  /**
   * Miqdor input o'zgarganda chaqiriladi va validatsiya bajaradi:
   * - Musbat butun son bo'lishi shart
   * - Zaxiradagi miqdordan oshmasligi shart
   * Xato bo'lsa miqdorError state'ga xabar yozadi.
   *
   * @param {React.ChangeEvent} e - Input change eventi
   */
  const handleMiqdorChange = (e) => {
    const val = e.target.value
    setMiqdor(val)
    setMiqdorError('')

    const count = Number(val)
    if (val && (isNaN(count) || count <= 0 || !Number.isInteger(count))) {
      setMiqdorError('Miqdor musbat butun son bo\'lishi kerak')
    } else if (selectedDori && count > selectedDori.miqdor) {
      setMiqdorError(`Zaxirada faqat ${selectedDori.miqdor} ta mavjud`)
    }
  }

  /**
   * "Savdoni tasdiqlash" tugmasi bosilganda yoki forma submit bo'lganda chaqiriladi.
   * Quyidagi amallarni bajaradi:
   *   1. Validatsiyani qayta tekshiradi
   *   2. updateDori() orqali dori zaxirasini kamaytiradi
   *   3. addSavdo() orqali savdoni tarixga yozadi
   *   4. Muvaffaqiyat xabarini ko'rsatadi
   *   5. Formani tozalaydi
   *
   * @param {React.FormEvent} e - Form submit eventi
   */
  const handleSavdoSubmit = (e) => {
    e.preventDefault()

    if (!selectedDori) return
    const count = Number(miqdor)

    // So'nggi validatsiya tekshiruvi
    if (!count || count <= 0 || !Number.isInteger(count)) {
      setMiqdorError('Miqdor musbat butun son bo\'lishi kerak')
      return
    }
    if (count > selectedDori.miqdor) {
      setMiqdorError(`Zaxirada faqat ${selectedDori.miqdor} ta mavjud`)
      return
    }

    // Dori zaxirasini sotilgan miqdorga kamaytiradi
    updateDori(selectedDori.id, {
      ...selectedDori,
      miqdor: selectedDori.miqdor - count,
    })

    // Savdoni tarixi ro'yxatiga qo'shadi
    addSavdo({
      doriId: selectedDori.id,
      doriNomi: selectedDori.nomi,
      kategoriya: selectedDori.kategoriya,
      miqdor: count,
      narx: selectedDori.narx,
      jami: selectedDori.narx * count,
    })

    setSuccessMsg(
      `${selectedDori.nomi} — ${count} ta muvaffaqiyatli sotildi. Jami: ${formatNarx(selectedDori.narx * count)}`,
    )
    handleReset()
  }

  /**
   * Savdo formasini boshlang'ich holatga qaytaradi.
   * Barcha state'larni tozalaydi: tanlangan dori, miqdor, qidiruv, xatolar.
   */
  const handleReset = () => {
    setSelectedDori(null)
    setSearch('')
    setMiqdor('')
    setMiqdorError('')
  }

  /**
   * Forma submit tugmasi active bo'lishi uchun barcha shartlarni tekshiradi:
   * - Dori tanlangan bo'lishi kerak
   * - Miqdor kiritilgan bo'lishi kerak
   * - Miqdor > 0 va butun son bo'lishi kerak
   * - Miqdor zaxiradan oshmasligi kerak
   */
  const isFormValid =
    selectedDori &&
    miqdor &&
    Number(miqdor) > 0 &&
    Number.isInteger(Number(miqdor)) &&
    Number(miqdor) <= selectedDori.miqdor

  // Ma'lumot yuklanayotganda spinner ko'rsatiladi
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yuklanmoqda...</span>
        </div>
      </div>
    )
  }

  // Yuklanish xatosi bo'lsa xabar ko'rsatiladi
  if (error) {
    return (
      <div className="alert alert-danger border-0 shadow-sm" role="alert">
        <i className="bi bi-exclamation-circle me-2"></i>
        {error}
      </div>
    )
  }

  return (
    <div className="row g-4">
      {/* Muvaffaqiyatli savdo xabari — faqat successMsg bo'lganda ko'rinadi */}
      {successMsg && (
        <div className="col-12">
          <div className="alert alert-success border-0 shadow-sm d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-check-circle-fill"></i>
            <span>{successMsg}</span>
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => setSuccessMsg('')}
              aria-label="Yopish"
            />
          </div>
        </div>
      )}

      {/* Savdo formasi */}
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="mb-0 fw-semibold">
              <i className="bi bi-cart3 text-primary me-2"></i>
              Yangi savdo
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSavdoSubmit} noValidate>
              {/* Dori qidirish input */}
              <div className="mb-3">
                <label htmlFor="doriSearch" className="form-label small text-muted mb-1">
                  Dori tanlash
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    id="doriSearch"
                    type="search"
                    className="form-control"
                    placeholder="Dori nomi yoki kategoriya bo'yicha qidiring..."
                    value={search}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />
                </div>

                {/* Qidiruv natijalari dropdown — dori tanlanmagan va qidiruv bo'lganda ko'rinadi */}
                {search && !selectedDori && (
                  <div className="border rounded mt-1 shadow-sm" style={{ maxHeight: 220, overflowY: 'auto' }}>
                    {filteredDorilar.length === 0 ? (
                      <div className="text-muted small px-3 py-2">
                        <i className="bi bi-info-circle me-1"></i>
                        Dori topilmadi
                      </div>
                    ) : (
                      filteredDorilar.map((dori) => (
                        <button
                          key={dori.id}
                          type="button"
                          className="d-flex align-items-center justify-content-between w-100 px-3 py-2 border-0 bg-transparent text-start hover-bg"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleDoriSelect(dori)}
                        >
                          <div>
                            <span className="fw-medium">{dori.nomi}</span>
                            <span className="text-muted small ms-2">{dori.kategoriya}</span>
                          </div>
                          <div className="text-end">
                            <span className="text-success small fw-medium">{formatNarx(dori.narx)}</span>
                            <span className="text-muted small ms-2">/ {dori.miqdor} ta</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Tanlangan dori ma'lumotlari — faqat selectedDori bo'lganda ko'rinadi */}
              {selectedDori && (
                <div className="alert alert-primary border-0 d-flex align-items-center justify-content-between py-2 px-3 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-capsule"></i>
                    <span className="fw-medium">{selectedDori.nomi}</span>
                    <span className="badge bg-primary-subtle text-primary">{selectedDori.kategoriya}</span>
                  </div>
                  <div className="text-end">
                    <span className="small">Narx: <strong>{formatNarx(selectedDori.narx)}</strong></span>
                    <span className="small ms-3">Zaxira: <strong>{selectedDori.miqdor} ta</strong></span>
                  </div>
                </div>
              )}

              {/* Miqdor input — selectedDori tanlanmasa disabled bo'ladi */}
              <div className="mb-3">
                <label htmlFor="miqdor" className="form-label small text-muted mb-1">
                  Miqdor (dona)
                </label>
                <input
                  id="miqdor"
                  type="number"
                  className={`form-control ${miqdorError ? 'is-invalid' : miqdor && isFormValid ? 'is-valid' : ''}`}
                  placeholder="Necha dona sotilsin?"
                  value={miqdor}
                  onChange={handleMiqdorChange}
                  min={1}
                  max={selectedDori?.miqdor ?? undefined}
                  disabled={!selectedDori}
                />
                {miqdorError && (
                  <div className="invalid-feedback">{miqdorError}</div>
                )}
                {selectedDori && !miqdorError && (
                  <div className="form-text">Maksimal: {selectedDori.miqdor} ta</div>
                )}
              </div>

              {/* Forma tugmalari */}
              <div className="d-flex gap-2">
                {/* isFormValid false bo'lsa submit tugmasi disabled */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isFormValid}
                >
                  <i className="bi bi-cart-check me-2"></i>
                  Savdoni tasdiqlash
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                  disabled={!selectedDori && !search}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Jami hisob paneli — real vaqtda yangilanadi */}
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="mb-0 fw-semibold">
              <i className="bi bi-receipt text-success me-2"></i>
              Hisob
            </h5>
          </div>
          <div className="card-body d-flex flex-column justify-content-between">
            <div>
              {/* Dori nomi qatori */}
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Dori</span>
                <span className="fw-medium">{selectedDori ? selectedDori.nomi : '—'}</span>
              </div>
              {/* Bitta dona narxi qatori */}
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Bitta narxi</span>
                <span className="fw-medium">
                  {selectedDori ? formatNarx(selectedDori.narx) : '—'}
                </span>
              </div>
              {/* Kiritilgan miqdor qatori */}
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Miqdor</span>
                <span className="fw-medium">
                  {miqdor && Number(miqdor) > 0 ? `${miqdor} ta` : '—'}
                </span>
              </div>
              {/* Jami narx — narx * miqdor, useMemo bilan hisoblanadi */}
              <div className="d-flex justify-content-between py-3 mt-1">
                <span className="fw-semibold fs-5">Jami</span>
                <span className={`fw-bold fs-5 ${jami > 0 ? 'text-success' : 'text-muted'}`}>
                  {jami > 0 ? formatNarx(jami) : '—'}
                </span>
              </div>
            </div>

            {/* Zaxira holati badge — miqdor <= 10 bo'lsa sariq ogohlantirish */}
            {selectedDori && (
              <div
                className={`alert mb-0 border-0 py-2 px-3 small ${
                  selectedDori.miqdor <= 10 ? 'alert-warning' : 'alert-success'
                }`}
              >
                <i
                  className={`bi me-1 ${
                    selectedDori.miqdor <= 10 ? 'bi-exclamation-triangle' : 'bi-check-circle'
                  }`}
                ></i>
                Zaxirada:{' '}
                <strong>
                  {selectedDori.miqdor} ta
                  {selectedDori.miqdor <= 10 ? ' (kam qolgan)' : ''}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SavdoPage
