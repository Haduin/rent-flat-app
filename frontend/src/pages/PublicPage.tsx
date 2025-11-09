import {Link} from "react-router";
import backgroundImage from '../../public/landing.jpg'

export default function PublicPage() {
    return (
        <div
            className="relative flex items-center justify-center h-screen w-full bg-cover bg-center"
            style={{backgroundImage: `url(${backgroundImage})`}}
        >
            <div className="absolute inset-0 bg-black/40"/>
            <div className="relative z-10 text-center text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                    Witaj w systemie mieszkań
                </h1>
                <p className="text-lg md:text-xl mb-6 drop-shadow">
                    Zarządzaj najemcami, umowami i płatnościami w jednym miejscu
                </p>
                <Link
                    to="/protected/home"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg transition text-lg font-semibold"
                >
                    Zaloguj się do systemu
                </Link>
            </div>
        </div>
    );
}