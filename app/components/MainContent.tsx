import { TypingAnimation } from "@/components/ui/typing-animation"
import Link from "next/link"

const MainContent = () => {
    return (
        <div className="max-w-xl h-80 flex flex-col">
            <div className="text-slate-400 pb-4">SISTEM PEMINJAMAN BUKU</div>
            <TypingAnimation loop typeSpeed={100} className="text-5xl font-extrabold">Data peminjaman perpustakaan, rapi dalam satu layar.</TypingAnimation>
            <div className="mt-auto">
                <div className="text-slate-400 py-4">Catat siapa meminjam buku apa, kapan harus kembali, dan mana yang terlambat — tanpa buku besar dan tanpa lembar kerja yang berserakan.</div>
                <div className="py-2 px-4 w-34 rounded-4xl bg-black text-white">
                    <Link href={"/pages/login"}>
                    Mulai Sekarang
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default MainContent