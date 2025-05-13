interface ConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationPopup({
  title,
  description,
  open,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-96">
        <h2 className="text-lg font-semibold text-center">{title}</h2>
        <p className="text-sm text-gray-500 text-center mt-2">{description}</p>
        <div className="flex justify-center mt-4 space-x-6">
          <button className="px-4 py-2 rounded-lg border" onClick={onCancel}>
            Откажи
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
            onClick={onConfirm}
          >
            Потвърди
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPopup;
