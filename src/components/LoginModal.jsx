import React from 'react';
import { Lock, X } from 'lucide-react';

export default function LoginModal({
    showLoginModal,
    setShowLoginModal,
    submitLogin,
    passwordInput,
    setPasswordInput,
    loginError,
    ntrBlue,
    isMaintenanceMode = false
}) {
    if (!showLoginModal) return null;

    return (
        <div className={`fixed inset-0 bg-black/${isMaintenanceMode ? '80' : '60'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Lock className="text-blue-900" /> Admin</h3>
                    {!isMaintenanceMode && (
                        <button onClick={() => setShowLoginModal(false)}><X size={24} /></button>
                    )}
                </div>
                <form onSubmit={submitLogin}>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full p-3 border rounded-lg mb-4"
                        placeholder="••••••••"
                        autoFocus
                    />
                    {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
                    <button type="submit" className={`w-full ${ntrBlue} text-white font-bold py-3 rounded-lg`}>Acceder</button>
                </form>
            </div>
        </div>
    );
}
