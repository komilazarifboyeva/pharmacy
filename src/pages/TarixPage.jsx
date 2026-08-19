import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatNarx, formatSana } from '../utils/format'

function TarixPage() {
  // Context'dan savdo tarixi ro'yxatini oladi
  const { savdolar } = useApp()

  // Qidiruv input qiymati (dori nomi yoki kategoriya bo'yicha)
  const [search, setSearch] = useState('')

  // Kategoriya filter qiymati (bo'sh = barcha kategoriyalar)
  const [kategoriyaFilter, setKategoriyaFilter] = useState('')

  // Sana filter qiymati (bo'sh = barcha sanalar)
  const [sanaFilter, setSanaFilter] = useState('')

  /**
   * Savdolar tarixidan unique kategoriyalar ro'yxatini chiqaradi.
   * Bo'sh kategoriyalar o'tkazib yuboriladi, alifbo tartibida saralanadi.
   * Kategoriya filter select'ini to'ldirish uchun ishlatiladi.
   */
  const kategoriyalar = useMemo(() => {
    return [...new Set(savdolar.map((s) => s.kategoriya).filter(Boolean))].sort()
  }, [savdolar])

  /**
   * Savdolarni qidiruv, kategoriya va sana filterlari bo'yicha filterlaydi.
   * Natija yangi → eskiga (descending sana) tartibida saralanadi.
   * Barcha filterlar ixtiyoriy — bo'sh bo'lsa o'sha filter qo'llanilmaydi.
   */
  const filteredSavdolar = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...savdolar]
      .sort((a, b) => new Date(b.sana) - new Date(a.sana)) // Yangi → eski
      .filter((savdo) => {
        // Dori nomi yoki kategoriya bo'yicha qidiruv
        const matchesSearch =
          !query ||
          savdo.doriNomi.toLowerCase().includes(query) ||
          savdo.kategoriya?.toLowerCase().includes(query)

        // Kategoriya bo'yicha filter
        const matchesKategoriya = !kategoriyaFilter || savdo.kategoriya === kategoriyaFilter

        // Sana bo'yicha filter — kun darajasida solishtiradi (vaqt e'tiborga olinmaydi)
        const matchesSana =
          !sanaFilter ||
          new Date(savdo.sana).toLocaleDateString('uz-UZ') ===
            new Date(sanaFilter).toLocaleDateString('uz-UZ')

        return matchesSearch && matchesKategoriya && matchesSana
      })
  }, [savdolar, search, kategoriyaFilter, sanaFilter])

  /**
   * Filterlangan savdolar bo'yicha yig'indi statistikani hisoblaydi.
   * Filter o'zgarganda avtomatik qayta hisoblanadi.
   * TarixPage tepasidagi 3 ta statistika kartasida ko'rsatiladi.
   *
   * @returns {{ jami: number, donalar: number, savdoSoni: number }}
   */
  const stats = useMemo(() => {
    return filteredSavdolar.reduce(
      (acc, savdo) => ({
        jami: acc.jami + savdo.jami,           // Umumiy pul tushumi
        donalar: acc.donalar + savdo.miqdor,   // Jami sotilgan donalar
        savdoSoni: acc.savdoSoni + 1,          // Savdolar soni
      }),
      { jami: 0, donalar: 0, savdoSoni: 0 },
    )
  }, [filteredSavdolar])

  // Hech bo'lmasa bitta filter qo'llanilganini tekshiradi
  // "Tozalash" tugmasini active/disabled qilish uchun ishlatiladi
  const hasFilters = search || kategoriyaFilter || sanaFilter

  /**
   * Barcha filterlarni boshlang'ich holatga qaytaradi.
   * "Tozalash" tugmasi bosilganda yoki "Filterni tozalash" linkiga bosilganda chaqiriladi.
   */
  const handleReset = () => {
    setSearch('')
    setKategoriyaFilter('')
    setSanaFilter('')
  }

  return (
    <>
      {/* Statistika kartalar — filterlangan natijalarga qarab o'zgaradi */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="icon-box bg-primary-subtle text-primary">
                <i className="bi bi-receipt"></i>
              </div>
              <div>
                <p className="text-muted small mb-0">Savdolar soni</p>
                <h4 className="mb-0 fw-bold">{stats.savdoSoni}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="icon-box bg-success-subtle text-success">
                <i className="bi bi-currency-dollar"></i>
              </div>
              <div>
                <p className="text-muted small mb-0">Jami tushum</p>
                {/* Tushum 0 bo'lsa "—" ko'rsatiladi */}
                <h4 className="mb-0 fw-bold text-success">
                  {stats.jami > 0 ? formatNarx(stats.jami) : '—'}
                </h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="icon-box bg-info-subtle text-info">
                <i className="bi bi-box-seam"></i>
              </div>
              <div>
                <p className="text-muted small mb-0">Sotilgan donalar</p>
                <h4 className="mb-0 fw-bold">{stats.donalar}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter paneli */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* Qidiruv input */}
            <div className="col-lg-4">
              <label htmlFor="tarixSearch" className="form-label small text-muted mb-1">
                Qidiruv
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  id="tarixSearch"
                  type="search"
                  className="form-control"
                  placeholder="Dori nomi yoki kategoriya..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Kategoriya filter select */}
            <div className="col-lg-3">
              <label htmlFor="kategoriyaFilter" className="form-label small text-muted mb-1">
                Kategoriya
              </label>
              <select
                id="kategoriyaFilter"
                className="form-select"
                value={kategoriyaFilter}
                onChange={(e) => setKategoriyaFilter(e.target.value)}
              >
                <option value="">Barcha kategoriyalar</option>
                {kategoriyalar.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Sana filter — tanlangan kun bo'yicha savdolarni filterlaydi */}
            <div className="col-lg-3">
              <label htmlFor="sanaFilter" className="form-label small text-muted mb-1">
                Sana
              </label>
              <input
                id="sanaFilter"
                type="date"
                className="form-control"
                value={sanaFilter}
                onChange={(e) => setSanaFilter(e.target.value)}
              />
            </div>

            {/* Filterlarni tozalash tugmasi — hech filter yo'q bo'lsa disabled */}
            <div className="col-lg-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={handleReset}
                disabled={!hasFilters}
              >
                <i className="bi bi-x-circle me-1"></i>
                Tozalash
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Savdo tarixi jadvali */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-clock-history text-primary me-2"></i>
            Savdo tarixi
          </h5>
          {/* Filter qo'llanilganda natijalar soni ko'rsatiladi */}
          {hasFilters && (
            <span className="badge bg-primary-subtle text-primary">
              {filteredSavdolar.length} ta natija
            </span>
          )}
        </div>

        {/* Bo'sh holat: hech qanday savdo yo'q */}
        {savdolar.length === 0 ? (
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox text-muted display-5 mb-3 d-block"></i>
            <p className="text-muted mb-0">Hali hech qanday savdo amalga oshirilmagan</p>
            <p className="text-muted small">Savdo sahifasidan birinchi savdoni boshlang</p>
          </div>
        ) : filteredSavdolar.length === 0 ? (
          /* Bo'sh holat: filter mos kelmadi */
          <div className="card-body text-center py-5">
            <i className="bi bi-search text-muted display-5 mb-3 d-block"></i>
            <p className="text-muted mb-0">Filter bo'yicha savdo topilmadi</p>
            <button className="btn btn-link text-decoration-none p-0 mt-1" onClick={handleReset}>
              Filterni tozalash
            </button>
          </div>
        ) : (
          /* Savdolar jadvali */
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 text-muted fw-medium small">#</th>
                  <th className="text-muted fw-medium small">Sana va vaqt</th>
                  <th className="text-muted fw-medium small">Dori nomi</th>
                  <th className="text-muted fw-medium small">Kategoriya</th>
                  <th className="text-muted fw-medium small text-center">Miqdor</th>
                  <th className="text-muted fw-medium small text-end">Bitta narxi</th>
                  <th className="text-muted fw-medium small text-end pe-4">Jami</th>
                </tr>
              </thead>
              <tbody>
                {filteredSavdolar.map((savdo, index) => (
                  <tr key={savdo.id}>
                    {/* Tartib raqami */}
                    <td className="ps-4 text-muted small">{index + 1}</td>

                    {/* Sana (formatSana) va vaqt (toLocaleTimeString) alohida ko'rsatiladi */}
                    <td>
                      <div className="fw-medium small">{formatSana(savdo.sana)}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(savdo.sana).toLocaleTimeString('uz-UZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td>
                      <span className="fw-medium">{savdo.doriNomi}</span>
                    </td>

                    {/* Kategoriya badge sifatida ko'rsatiladi */}
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-normal">
                        {savdo.kategoriya || '—'}
                      </span>
                    </td>

                    <td className="text-center">
                      <span className="badge bg-light text-dark border fw-normal">
                        {savdo.miqdor} ta
                      </span>
                    </td>

                    <td className="text-end small text-muted">{formatNarx(savdo.narx)}</td>

                    {/* Jami = narx * miqdor, yashil rangda ko'rsatiladi */}
                    <td className="text-end pe-4 fw-semibold text-success">
                      {formatNarx(savdo.jami)}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Footer: filterlangan natijalar bo'yicha yig'indi */}
              <tfoot className="table-light">
                <tr>
                  <td colSpan={4} className="ps-4 fw-semibold small text-muted">
                    Jami ({filteredSavdolar.length} ta savdo)
                  </td>
                  <td className="text-center fw-semibold small">{stats.donalar} ta</td>
                  <td></td>
                  <td className="text-end pe-4 fw-bold text-success">{formatNarx(stats.jami)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default TarixPage
