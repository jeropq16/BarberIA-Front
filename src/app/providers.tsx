'use client'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastClassName="bg-[#0a0a0a] border border-[#1a1a1a] text-white"
                progressClassName="bg-[#dc2626]"
            />
        </>
    )
}

