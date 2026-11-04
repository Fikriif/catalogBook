import type { Dispatch, SetStateAction } from "react";

interface modalProps{
    setModal: Dispatch<SetStateAction<boolean>>
}

const Modal = ({setModal} : modalProps) => {
    const handleClick = () => {
        setModal(false)
    }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 text-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold"> Modal Title </h2>
        <p className="mb-6">Modal</p>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
            onClick={handleClick}
          >
            Batal
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
