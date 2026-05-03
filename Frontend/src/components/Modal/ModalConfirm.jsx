// components/ModalConfirm.jsx

import Modal from "./ModalConfỉm";

export default function ModalConfirm({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure ?",
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <p className="text-gray-600 mb-10">{message}</p>
      <div className="flex justify-around space-x-3 gap-10">
        <button
          onClick={onClose}
          className="px-4 flex-1 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Hủy
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="px-4 py-2 flex-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}
