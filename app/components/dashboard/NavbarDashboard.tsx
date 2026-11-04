import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

const NavbarDashboard = () => {
  return (
    <div className="flex flex-row justify-between items-center p-8">

      <div className="flex flex-row items-center">
        <Image src={"/logo.png"} alt="Logo Web" width={100} height={100} />
        <div>
          <div className="font-extrabold text-2xl">Arsip</div>
          <div className="text-slate-400 text-xs">Perpustakaan Digital</div>
        </div>
      </div>

      <div className="flex flex-row items-center gap-10">
        <input placeholder="Search..." className="border border-gray-200 py-2 pr-15 pl-4 rounded-2xl"/>
        <button className="px-6 py-2 rounded-2xl border border-gray-200">Laporan</button>
        <UserButton />
      </div>
    </div>
  );
};

export default NavbarDashboard;
