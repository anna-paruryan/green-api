import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { PhoneOff, Mic, MicOff, User, Volume2, Video, VideoOff } from "lucide-react"
import type { Chat } from "../../types/chatTypes.ts"

interface CallOverlayProps {
    chat: Chat
    onEnd: () => void
    isVideo?: boolean
}

export default function CallOverlay({ chat, onEnd, isVideo = false }: CallOverlayProps) {
    const [seconds, setSeconds] = useState(0)
    const [muted, setMuted] = useState(false)
    const [cameraOff, setCameraOff] = useState(false)
    const [status, setStatus] = useState<"calling" | "connected">("calling")

    // Имитация «соединения»
    useEffect(() => {
        const t = setTimeout(() => setStatus("connected"), 2000)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        if (status !== "connected") return
        const id = setInterval(() => setSeconds((s) => s + 1), 1000)
        return () => clearInterval(id)
    }, [status])

    // Esc для завершения звонка
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onEnd()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onEnd])

    const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
    const ss = String(seconds % 60).padStart(2, "0")

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-[var(--max-text)] px-6 py-12 text-[var(--max-text-on-primary)]"
        >
            <div className="mt-16 flex flex-col items-center gap-4">
                <div className="flex size-32 items-center justify-center rounded-full bg-[var(--max-surface-hover)] overflow-hidden">
                    {chat.avatarUrl ? (
                        <img
                            src={chat.avatarUrl}
                            alt={chat.name}
                            className="size-32 rounded-full object-cover"
                        />
                    ) : (
                        <User className="size-14 text-[var(--max-text-muted)]" strokeWidth={1.5} />
                    )}
                </div>
                <p className="text-[28px] font-light">{chat.name}</p>
                <p className="text-[15px] text-[var(--max-text-muted)]">
                    {status === "calling"
                        ? isVideo ? "Video calling…" : "Calling…"
                        : `${mm}:${ss}`}
                </p>
            </div>

            <div className="mb-8 flex items-center gap-8">
                <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="flex flex-col items-center gap-2"
                >
                    <div
                        className={`flex size-14 items-center justify-center rounded-full ${
                            muted
                                ? "bg-[var(--max-text-on-primary)] text-[var(--max-text)]"
                                : "bg-[var(--max-surface-hover)] text-[var(--max-text-on-primary)]"
                        }`}
                    >
                        {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                    </div>
                    <span className="text-xs text-[var(--max-text-muted)]">Mute</span>
                </button>

                {isVideo && (
                    <button
                        type="button"
                        onClick={() => setCameraOff((c) => !c)}
                        className="flex flex-col items-center gap-2"
                    >
                        <div
                            className={`flex size-14 items-center justify-center rounded-full ${
                                cameraOff
                                    ? "bg-[var(--max-text-on-primary)] text-[var(--max-text)]"
                                    : "bg-[var(--max-surface-hover)] text-[var(--max-text-on-primary)]"
                            }`}
                        >
                            {cameraOff ? <VideoOff className="size-6" /> : <Video className="size-6" />}
                        </div>
                        <span className="text-xs text-[var(--max-text-muted)]">Camera</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={onEnd}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="flex size-16 items-center justify-center rounded-full bg-[var(--max-danger)]">
                        <PhoneOff className="size-7" />
                    </div>
                    <span className="text-xs text-[var(--max-text-muted)]">End</span>
                </button>

                {!isVideo && (
                    <button type="button" className="flex flex-col items-center gap-2">
                        <div className="flex size-14 items-center justify-center rounded-full bg-[var(--max-surface-hover)]">
                            <Volume2 className="size-6" />
                        </div>
                        <span className="text-xs text-[var(--max-text-muted)]">Speaker</span>
                    </button>
                )}
            </div>
        </motion.div>
    )
}