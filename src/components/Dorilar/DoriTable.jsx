import { formatNarx } from '../../utils/format'

function MiqdorBadge({ miqdor }) {
  if (miqdor === 0) {
    return <span className="badge text-bg-danger">Tugagan</span>
  }
  if (miqdor < 20) {
    return <span className="badge text-bg-warning text-dark">{miqdor}</span>
  }
  return <span className="badge text-bg-success-subtle text-success-emphasis border">{miqdor}</span>
}

function DoriTable({ dorilar, onEdit, onDelete }) {
  if (dorilar.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-search display-6 d-block mb-3"></i>
        Hech qanday dori topilmadi
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Dori nomi</th>
            <th>Kategoriya</th>
            <th>Miqdor</th>
            <th>Narx</th>
            <th className="text-end">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {dorilar.map((dori, index) => (
            <tr key={dori.id}>
              <td className="text-muted">{index + 1}</td>
              <td className="fw-semibold">{dori.nomi}</td>
              <td>
                <span className="badge text-bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                  {dori.kategoriya}
                </span>
              </td>
              <td>
                <MiqdorBadge miqdor={dori.miqdor} />
              </td>
              <td>{formatNarx(dori.narx)}</td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => onEdit(dori)}
                    title="Tahrirlash"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => onDelete(dori)}
                    title="O'chirish"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DoriTable
