function DeleteConfirmModal({ show, dori, onClose, onConfirm }) {
  if (!show || !dori) return null

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold text-danger">
                <i className="bi bi-trash me-2"></i>
                Dorini o'chirish
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Yopish"></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">
                <strong>{dori.nomi}</strong> dorini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Bekor qilish
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}>
                O'chirish
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  )
}

export default DeleteConfirmModal
