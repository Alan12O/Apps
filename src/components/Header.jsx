import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, Edit, Home, PlusCircle, LogOut } from 'lucide-react';

export default function Header({
    showNtrLogo,
    ntrBlue,
    handleLogoClick,
    handleAdminTrigger,
    isAdmin,
    isEditMode,
    setIsEditMode,
    signOut,
    auth,
    showNotification,
    resetForm
}) {
    const location = useLocation();

    return (
        <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={handleLogoClick}>
                    <div className={`${ntrBlue} px-3 py-2 rounded shadow-md flex flex-col items-center justify-center transition-colors group-hover:bg-blue-800 w-[72px] h-[52px]`}>
                        {showNtrLogo ? (
                            <>
                                <span className="font-serif text-3xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: 'Times New Roman, serif' }}>NTR</span>
                                <span className="text-[0.5rem] text-white font-bold tracking-[0.2em] uppercase leading-none mt-1 opacity-90">Periodismo</span>
                            </>
                        ) : (
                            <>
                                <span className="font-sans text-xl font-black text-white leading-none tracking-tight">AVISOS</span>
                                <span className="text-[0.4rem] text-white font-bold tracking-widest uppercase leading-none mt-1 opacity-90">CIUDADANOS</span>
                            </>
                        )}
                    </div>
                    <h1 onDoubleClick={handleAdminTrigger} className="text-xl font-bold tracking-tight text-gray-700 hidden sm:block">Zacatecas</h1>
                </div>

                <div className="flex items-center gap-4">
                    {isAdmin && <div className="hidden sm:flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse"><Lock size={12} /> ADMIN</div>}
                    {isEditMode && !isAdmin && <div className="hidden sm:flex items-center gap-2 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse"><Edit size={12} /> EDICIÓN</div>}
                    <nav className="flex items-center gap-2 sm:gap-4">
                        <Link to="/" className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${location.pathname === '/' || location.pathname.startsWith('/noticia/') || location.pathname === '/terminos' ? 'bg-gray-100 text-blue-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <Home size={18} /> <span className="hidden sm:inline">Inicio</span>
                        </Link>
                        <Link to="/redaccion" onClick={resetForm} className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${location.pathname === '/redaccion' ? `${ntrBlue} text-white shadow-lg` : 'text-gray-500 hover:bg-gray-50'}`}>
                            <PlusCircle size={18} /> <span className="hidden sm:inline">Redacción</span>
                        </Link>
                        {isAdmin && <button onClick={() => { signOut(auth); showNotification("Sesión cerrada", "error"); }} className="p-2 text-gray-400 hover:text-red-600"><LogOut size={18} /></button>}
                        {isEditMode && !isAdmin && <button onClick={() => { setIsEditMode(false); showNotification("Saliste del modo edición", "error"); }} className="p-2 text-gray-400 hover:text-blue-600" title="Salir de Modo Edición"><LogOut size={18} /></button>}
                    </nav>
                </div>
            </div>
        </header>
    );
}
