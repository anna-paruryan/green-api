import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useGreenApi } from "../context/GreenApiContext.tsx"

function SessionLoader() {
    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-[var(--max-bg)]">
            <div
                aria-label="Loading"
                className="size-8 animate-spin rounded-full border-2 border-[var(--max-border)] border-t-[var(--max-primary)]"
            />
        </div>
    )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isConnected, isInitializing } = useGreenApi()

    if (isInitializing) {
        return <SessionLoader />
    }

    if (!isConnected) {
        return <Navigate to="/login" replace />
    }

    return children
}