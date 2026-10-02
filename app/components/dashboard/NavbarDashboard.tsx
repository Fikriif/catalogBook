import Image from "next/image";

const NavbarDashboard = () => {
  return (
    <div>
      <div className="flex flex-row items-center">
        <Image src={"/logo.png"} alt="Logo Web" width={100} height={100} />
        <div>
          <div className="font-extrabold text-2xl">Arsip</div>
          <div className="text-slate-400 text-xs">Perpustakaan Digital</div>
        </div>
      </div>
    </div>
  );
};

export default NavbarDashboard;
