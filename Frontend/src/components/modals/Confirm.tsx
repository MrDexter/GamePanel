type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-popover/75 flex items-center justify-center z-50">
      <div className="bg-card border border-border p-4 rounded-md w-80">
        <h2 className="text-sm font-bold">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 border border-border rounded-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-foreground rounded-sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}