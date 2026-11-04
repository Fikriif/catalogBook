interface CardProps {
    angka: number;
    judul: string;
    deskripsi: string;
}

const Card = ({angka, judul, deskripsi} : CardProps) => {
  return (
    <div className="w-md rounded-3xl shadow-2xl">
        <div className="p-5">
            <div className="text-blue-600">{angka}</div>
            <div className="font-extrabold text-xl py-2">{judul}</div>
            <div className="text-slate-400">{deskripsi}</div>
        </div> 
    </div>
  )
}
export default Card