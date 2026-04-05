import { useState } from 'react'

type InputModalProps = {
  open: boolean;
  title: string;
  label?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
};

export default function InputModal({
  open,
  title,
  label,
  onSubmit,
  onClose,
}: InputModalProps) {
  const [value, setValue] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-popover/75 flex items-center justify-center z-50">
      <div className="bg-card border border-border p-4 rounded-md w-80">
        <h2 className="text-sm font-bold">{title}</h2>

        {label && (
          <label className="text-xs text-muted-foreground mt-2 block">
            {label}
          </label>
        )}

        <input
          className="w-full mt-1 border border-border p-2 text-xs bg-background"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 border border-border rounded-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-green-700 text-foreground rounded-sm"
            onClick={() => {
              onSubmit(value);
              onClose();
              setValue("");
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}