import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { MessageCircle, Home, SearchX } from "lucide-react"

export default function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="flex h-full min-h- w-full items-center justify-center bg-[var(--max-bg)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex w-full max-w- flex-col items-center rounded-[var(--max-radius-lg)] border border-[var(--max-border)] bg-[var(--max-surface)] p-8 shadow-[var(--max-shadow)] sm:p-10"
            >
                {/* Иконка */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                    className="relative mb-6"
                >
                    <div className="flex size-20 items-center justify-center rounded-full bg-[var(--max-primary-soft)] text-[var(--max-primary)]">
                        <SearchX className="size-9" />
                    </div>
                    <div className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-[var(--max-surface)] shadow-[var(--max-shadow-message)] border border-[var(--max-border)]">
                        <MessageCircle className="size-4 text-[var(--max-text-muted)]" />
                    </div>
                </motion.div>

                {/* Текст */}
                <h1 className="text- font-bold leading-none tracking-[-0.04em] text-[var(--max-text)]">
                    404
                </h1>

                <h2 className="mt-3 text-center text- font-semibold leading-6 text-[var(--max-text)]">
                    Страница не найдена
                </h2>

                <p className="mt-2 max-w- text-center text- leading- text-[var(--max-text-secondary)]">
                    Похоже, этот чат улетел в архив. Проверь ссылку или вернись к своим сообщениям.
                </p>

                {/* Кнопки */}
                <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--max-primary)] px-6 text- font-medium text-[var(--max-text-on-primary)] transition hover:bg-[var(--max-primary-hover)] active:scale-[0.98]"
                    >
                        <Home className="size-4" />
                       Go Home
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--max-border)] bg-[var(--max-surface)] px-6 text- font-medium text-[var(--max-text)] transition hover:bg-[var(--max-surface-hover)] active:scale-[0.98]"
                    >
                        Back
                    </button>
                </div>

                <p className="mt-8 text- text-[var(--max-text-muted)]">
                    ERROR CODE: WATSUP_404_CHAT
                </p>
            </motion.div>
        </div>
    )
}