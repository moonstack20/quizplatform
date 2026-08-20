function ConfirmDialog({
    open,
    title = "Are you sure?",
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
  }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-slate-900/40" onClick={onCancel} />
        <div className="relative bg-white rounded-lg shadow-lg border border-slate-200 w-full max-w-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">{title}</h2>
          <p className="text-sm text-slate-500 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="text-sm px-4 py-2 rounded text-slate-600 hover:bg-slate-100"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="text-sm px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default ConfirmDialog;
  