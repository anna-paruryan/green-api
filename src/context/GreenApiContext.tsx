import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import type { GreenApiCredentials, StateInstance } from "../api/green-api/types.ts"
import { createGreenApiClient } from "../api/green-api/createGreenApiClient.ts"

const STORAGE_KEY = "green-api-session"

interface GreenApiContextValue {
    credentials: GreenApiCredentials | null
    api: ReturnType<typeof createGreenApiClient> | null

    isConnected: boolean
    isConnecting: boolean
    // True only during the initial session-restore attempt on app load.
    // Route guards must wait for this before deciding to redirect to /login,
    // otherwise a valid session gets bounced on every refresh.
    isInitializing: boolean

    state: StateInstance | null
    error: string | null

    connect: (credentials: GreenApiCredentials) => Promise<void>
    disconnect: () => void
}

const GreenApiContext = createContext<GreenApiContextValue | null>(null)

function readStoredCredentials(): GreenApiCredentials | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw) as GreenApiCredentials
    } catch {
        // corrupted/old-shape entry — ignore rather than crash the app
        return null
    }
}

export function GreenApiProvider({
                                     children,
                                 }: {
    children: React.ReactNode
}) {
    const [credentials, setCredentials] =
        useState<GreenApiCredentials | null>(null)

    const [api, setApi] =
        useState<ReturnType<typeof createGreenApiClient> | null>(null)

    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isInitializing, setIsInitializing] = useState(true)

    const [state, setState] = useState<StateInstance | null>(null)
    const [error, setError] = useState<string | null>(null)

    const connect = useCallback(
        async (nextCredentials: GreenApiCredentials) => {
            setIsConnecting(true)
            setError(null)

            try {
                const nextApi = createGreenApiClient(nextCredentials)

                const response = await nextApi.account.getStateInstance()
                const nextState = response.stateInstance as StateInstance

                setState(nextState)

                if (nextState !== "authorized") {
                    throw new Error(
                        `GREEN-API instance is not authorized. Current state: ${nextState}`,
                    )
                }

                setCredentials(nextCredentials)
                setApi(nextApi)
                setIsConnected(true)

                // Persist so a refresh can restore the session instead of
                // dropping the user back on the login screen.
                localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCredentials))
            } catch (error) {
                setCredentials(null)
                setApi(null)
                setIsConnected(false)
                localStorage.removeItem(STORAGE_KEY)

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to connect to GREEN-API",
                )

                throw error
            } finally {
                setIsConnecting(false)
            }
        },
        [],
    )

    const disconnect = useCallback(() => {
        setCredentials(null)
        setApi(null)
        setIsConnected(false)
        setState(null)
        setError(null)
        localStorage.removeItem(STORAGE_KEY)
    }, [])

    // Runs once on mount, before any consumer can redirect based on
    // isConnected. Re-validates the stored credentials against GREEN-API
    // (they may have been revoked) rather than trusting storage blindly.
    useEffect(() => {
        const stored = readStoredCredentials()

        if (!stored) {
            setIsInitializing(false)
            return
        }

        connect(stored)
            .catch(() => {
                // invalid/expired — connect() already cleared storage and state
            })
            .finally(() => setIsInitializing(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const value = useMemo(
        () => ({
            credentials,
            api,
            isConnected,
            isConnecting,
            isInitializing,
            state,
            error,
            connect,
            disconnect,
        }),
        [
            credentials,
            api,
            isConnected,
            isConnecting,
            isInitializing,
            state,
            error,
            connect,
            disconnect,
        ],
    )

    return (
        <GreenApiContext.Provider value={value}>
            {children}
        </GreenApiContext.Provider>
    )
}

export function useGreenApi() {
    const context = useContext(GreenApiContext)

    if (!context) {
        throw new Error(
            "useGreenApi must be used inside GreenApiProvider",
        )
    }

    return context
}