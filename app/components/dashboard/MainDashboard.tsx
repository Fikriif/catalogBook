"use client";

import { useState } from "react";
import Modal from "./Modal";

const MainDashboard = ({ username }: any) => {
  const [modal, setModal] = useState(false);

  const handleClick = () => {
    setModal(true);
  };

  return (
    <div className="w-full flex justify-between">
      <div className="w-100 h-100 rounded-2xl border border-gray-200 shadow-2xl bg-white ml-20 px-7 pt-4">
        <div className="text-gray-500 text-2xl">NAVIGASI</div>
        <ul className="list-disc text-gray-500 text-3xl px-7 pt-3 border-b-2 border-gray-300">
          <li className="pr-15 py-2 pl-4 hover:bg-gray-300 rounded-4xl hover:text-blue-400">
            Peminjaman
          </li>
          <li className="pr-15 py-2 pl-4 hover:bg-gray-300 rounded-4xl hover:text-blue-400">
            Pengembalian
          </li>
          <li className="pr-15 py-2 pl-4 hover:bg-gray-300 rounded-4xl hover:text-blue-400">
            Anggota
          </li>
          <li className="pr-15 py-2 pl-4 hover:bg-gray-300 rounded-4xl hover:text-blue-400 mb-10">
            Katalog Buku
          </li>
        </ul>
        <div className="text-gray-500 p-6">Diperbarui 09:41 WIB</div>
      </div>
      <div className="flex flex-row justify-between w-full">
        <div className="text-3xl font-extrabold pl-10">Selamat Datang, {username}</div>
        <div className="pr-20">
          <button
            className="py-2 px-7 bg-black rounded-3xl text-white"
            onClick={handleClick}
          >
            + Peminjaman Buku
          </button>
        </div>
      </div>

      {modal ? <Modal setModal={setModal} /> : ""}
    </div>
  );
};

export default MainDashboard;
