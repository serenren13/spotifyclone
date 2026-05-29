export default function ConfirmationModal({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isDangerous = true 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--accent-secondary)]/20 max-w-sm w-full mx-4 shadow-2xl">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    {title}
                </h2>
                <p className="text-[var(--text-light)] text-sm mb-6">
                    {message}
                </p>
                
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--accent-secondary)]/30 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80 transition-colors text-sm font-medium cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                            isDangerous
                                ? 'bg-red-500/80 hover:bg-red-600 text-white border border-red-400/50'
                                : 'bg-[var(--accent-primary)]/80 hover:bg-[var(--accent-primary)] text-black border border-[var(--accent-primary)]/50'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
