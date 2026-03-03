import React from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function Notification({ notification, closeNotification }) {
    if (!notification.show) return null;

    return (
        <div
            className={`fixed top-6 left-1/2 z-[100] px-6 py-3.5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-3 transition-all duration-400 ease-out transform bg-gradient-to-r from-blue-600 to-blue-900 text-white border border-blue-400/50 ${notification.isVisible
                ? '-translate-x-1/2 translate-y-0 opacity-100 scale-100'
                : '-translate-x-1/2 -translate-y-24 opacity-0 scale-95'
                }`}
        >
            {notification.type === 'success' ? <CheckCircle size={20} className="text-blue-100" /> : <AlertTriangle size={20} className="text-blue-100" />}
            <span className="font-bold tracking-wide text-sm whitespace-nowrap">{notification.message}</span>
            <button
                onClick={closeNotification}
                className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors focus:outline-none"
            >
                <X size={14} />
            </button>
        </div>
    );
}
