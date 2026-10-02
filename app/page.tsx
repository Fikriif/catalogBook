import Card from "./components/Card";
import MainContent from "./components/MainContent";
import NavbarComponent from "./components/NavbarComponent";

export default function Home() {
  return (
    <>
      <NavbarComponent />
      <div className="mx-[10%] pt-10">
        <MainContent />
        
        <div className="pt-16 flex flex-row gap-4 pb-10">
          <Card angka={1} judul={"Catat peminjaman"} deskripsi={"Tambah peminjaman baru lengkap dengan kartu anggota dan tanggal jatuh tempo."} />
          <Card angka={2} judul={"Pantau keterlambatan"} deskripsi={"Buku yang melewati jatuh tempo langsung terlihat beserta denda berjalan."} />
          <Card angka={3} judul={"Kelola katalog"} deskripsi={"Semua koleksi tersusun rapi per kategori dan siap dicari dalam sekejap."} />
        </div>

        <div className="border border-slate-100"></div>
      

      </div>
    </>
  );
}
