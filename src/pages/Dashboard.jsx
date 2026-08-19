import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { formatNarx, formatSana } from '../utils/format'

// Zaxira "kam qolgan" deb hisoblanadigan chegara miqdori
const KAM_QOLGAN_CHEGARA = 10

function Dashboard() {
  // Context'dan dorilar ro'yxati, savdo tarixi va yuklanish holati
  const { dorilar, savdolar, loading } = useApp()

  // Jami necha xil dori mavjudligini hisoblaydi (dorilar massivi uzunligi)
  const jamilDorilar = dorilar.length

  /**
   * Zaxirasi KAM_QOLGAN_CHEGARA (10) dan kam yoki teng bo'lgan
   * dorilar ro'yxatini filterlaydi.
   * "Kam qolgan" kartasida son va dori nomlari ko'rsatiladi.
   */
  const kamQolganDorilar = useMemo(
    () => dorilar.filter((d) => d.miqdor <= KAM_QOLGAN_CHEGARA),
    [dorilar],
  )

  /**
   * Faqat bugungi kun uchun savdo soni va jami tushum hisoblanadi.
   * toDateString() bilan faqat kun taqqoslanadi, vaqt e'tiborga olinmaydi.
   *
   * @returns {{ soni: number, tushum: number }}
   */
  const bugunStats = useMemo(() => {
    const today = new Date().toDateString()
    const bugungiSavdolar = savdolar.filter(
      (s) => new Date(s.sana).toDateString() === today,
    )
    return {
      soni: bugungiSavdolar.length,
      tushum: bugungiSavdolar.reduce((sum, s) => sum + s.jami, 0),
    }
  }, [savdolar])

  /**
   * Barcha savdolarni sanasi bo'yicha kamayish tartibida saralab,
   * oxirgi 5 tasini qaytaradi.
   * Dashboard'dagi "Oxirgi savdolar" jadvalida ko'rsatiladi.
   */
  const oxirgiSavdolar = useMemo(
    () =>
      [...savdolar]
        .sort((a, b) => new Date(b.sana) - new Date(a.sana))
        .slice(0, 5),
    [savdolar],
  )

  /**
   * Barcha savdolar bo'yicha har bir dori uchun jami sotilgan
   * miqdor va tushum hisoblanadi. Eng ko'p sotilgan 5 ta dori
   * miqdor bo'yicha kamayish tartibida qaytariladi.
   * Progress bar foizi birinchi dorining miqdoriga nisbatan hisoblanadi.
   *
   * @returns {Array<{ doriNomi, kategoriya, jami, miqdor }>}
   */
  const topDorilar = useMemo(() => {
    const map = {}
    savdolar.forEach((s) => {
      if (!map[s.doriId]) {
        map[s.doriId] = { doriNomi: s.doriNomi, kategoriya: s.kategoriya, jami: 0, miqdor: 0 }
      }
      map[s.doriId].jami += s.jami       // Jami tushum yig'iladi
      map[s.doriId].miqdor += s.miqdor   // Jami sotilgan dona yig'iladi
    })
    return Object.values(map)
      .sort((a, b) => b.miqdor - a.miqdor) // Ko'p sotilganidan kamiga
      .slice(0, 5)
  }, [savdolar])

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

  return (
    <>
      {/* Statistika kartalar — 4 ta asosiy ko'rsatkich */}
      <div className="row g-4 mb-4">

        {/* Jami dorilar — necha xil dori mavjud */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Jami dorilar</p>
                  <h3 className="mb-0 fw-bold">{jamilDorilar}</h3>
                </div>
                <div className="icon-box bg-primary-subtle text-primary">
                  <i className="bi bi-capsule"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kam qolgan dorilar — chegara <= 10, mavjud bo'lsa sariq, qaysilar ekanligini ham ko'rsatadi */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Kam qolgan</p>
                  <h3 className={`mb-0 fw-bold ${kamQolganDorilar.length > 0 ? 'text-warning' : ''}`}>
                    {kamQolganDorilar.length}
                  </h3>
                </div>
                <div className="icon-box bg-warning-subtle text-warning">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
              </div>
              {/* Kam qolgan dorilar mavjud bo'lsa birinchi 2 ta nomini ko'rsatadi */}
              {kamQolganDorilar.length > 0 && (
                <p className="text-muted small mb-0 mt-2">
                  {kamQolganDorilar.slice(0, 2).map((d) => d.nomi).join(', ')}
                  {kamQolganDorilar.length > 2 && ` va yana ${kamQolganDorilar.length - 2} ta`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bugungi savdo — shu kungi jami tushum */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Bugungi savdo</p>
                  {/* Tushum 0 bo'lsa "—" ko'rsatiladi */}
                  <h3 className="mb-0 fw-bold text-success">
                    {bugunStats.tushum > 0 ? formatNarx(bugunStats.tushum) : '—'}
                  </h3>
                </div>
                <div className="icon-box bg-success-subtle text-success">
                  <i className="bi bi-currency-dollar"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bugungi savdolar soni */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small mb-1">Savdolar soni</p>
                  <h3 className="mb-0 fw-bold">{bugunStats.soni}</h3>
                </div>
                <div className="icon-box bg-info-subtle text-info">
                  <i className="bi bi-receipt"></i>
                </div>
              </div>
              <p className="text-muted small mb-0 mt-2">Bugun</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Oxirgi 5 ta savdo jadvali */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="mb-0 fw-semibold">
                <i className="bi bi-clock-history text-primary me-2"></i>
                Oxirgi savdolar
              </h6>
            </div>

            {/* Bo'sh holat: hech qanday savdo amalga oshirilmagan */}
            {oxirgiSavdolar.length === 0 ? (
              <div className="card-body text-center py-4">
                <i className="bi bi-inbox text-muted fs-2 d-block mb-2"></i>
                <p className="text-muted small mb-0">Hali savdo amalga oshirilmagan</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 text-muted fw-medium small">Dori</th>
                      <th className="text-muted fw-medium small text-center">Miqdor</th>
                      <th className="text-muted fw-medium small text-end">Jami</th>
                      <th className="text-muted fw-medium small text-end pe-4">Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oxirgiSavdolar.map((savdo) => (
                      <tr key={savdo.id}>
                        <td className="ps-4">
                          <div className="fw-medium small">{savdo.doriNomi}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {savdo.kategoriya}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border fw-normal">
                            {savdo.miqdor} ta
                          </span>
                        </td>
                        <td className="text-end fw-semibold text-success small">
                          {formatNarx(savdo.jami)}
                        </td>
                        {/* Sana va vaqt alohida qatorlarda */}
                        <td className="text-end pe-4 text-muted small">
                          <div>{formatSana(savdo.sana)}</div>
                          <div style={{ fontSize: '0.72rem' }}>
                            {new Date(savdo.sana).toLocaleTimeString('uz-UZ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Eng ko'p sotilgan dorilar (top 5) */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="mb-0 fw-semibold">
                <i className="bi bi-bar-chart text-success me-2"></i>
                Eng ko'p sotilgan
              </h6>
            </div>

            {/* Bo'sh holat: hech qanday savdo yo'q */}
            {topDorilar.length === 0 ? (
              <div className="card-body text-center py-4">
                <i className="bi bi-inbox text-muted fs-2 d-block mb-2"></i>
                <p className="text-muted small mb-0">Ma'lumot yo'q</p>
              </div>
            ) : (
              <div className="card-body p-0">
                {topDorilar.map((dori, index) => {
                  // Progress bar foizi: birinchi dori (eng ko'p sotilgan) = 100%
                  // qolganlar unga nisbatan hisoblanadi
                  const maxMiqdor = topDorilar[0].miqdor
                  const foiz = Math.round((dori.miqdor / maxMiqdor) * 100)

                  return (
                    <div key={dori.doriNomi} className="px-4 py-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-2">
                          {/* Tartib raqami badge */}
                          <span
                            className="badge rounded-pill bg-primary-subtle text-primary fw-normal"
                            style={{ minWidth: 24 }}
                          >
                            {index + 1}
                          </span>
                          <span className="fw-medium small">{dori.doriNomi}</span>
                        </div>
                        <span className="text-muted small">{dori.miqdor} ta</span>
                      </div>
                      {/* Sotilgan miqdor nisbatini vizualizatsiya qiluvchi progress bar */}
                      <div className="progress" style={{ height: 4 }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${foiz}%` }}
                          aria-valuenow={foiz}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Zaxirasi kam qolgan dorilar haqida ogohlantirish — faqat mavjud bo'lsa ko'rinadi */}
            {kamQolganDorilar.length > 0 && (
              <div className="card-footer bg-warning-subtle border-0 py-2 px-4">
                <p className="small mb-0 text-warning-emphasis">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  <strong>{kamQolganDorilar.length} ta dori</strong> zaxirasi kam qolgan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
