import { motion } from "framer-motion"
import {
    X,
    User,
    Phone,
    Video,
    Search,
    BellOff,
    Image,
    Star,
    Lock,
    Trash2,
} from "lucide-react"
import type { Chat } from "../../types/chatTypes.ts"
import { formatLastSeen } from "../../utils/formatTime.ts"

interface ContactInfoDrawerProps {
    chat: Chat
    onClose: () => void
    onCall: () => void
    onVideoCall?: () => void
    onSearch?: () => void
    onDeleteChat: () => void
}

function getInitials(value: string): string | null {
    const trimmed = value.trim()
    if (!trimmed || /^[\d\s+\-()]+$/.test(trimmed)) return null
    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return trimmed.slice(0, 2).toUpperCase()
}

export default function ContactInfoDrawer({
                                              chat,
                                              onClose,
                                              onCall,
                                              onVideoCall,
                                              onSearch,
                                              onDeleteChat,
                                          }: ContactInfoDrawerProps) {
    const initials = getInitials(chat.name)
    const phone = `+${chat.id.replace(/\D/g, "")}`
    const lastSeen = chat.lastMessageAt
        ? formatLastSeen(chat.lastMessageAt)
        : "online"

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-[var(--max-overlay-dark)]"
                onClick={onClose}
            />

            <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 36 }}
                className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-[var(--max-surface)] shadow-2xl"
            >
                {/* Header */}
                <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-[var(--max-border)] px-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-9 items-center justify-center rounded-full text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-secondary)]"
                    >
                        <X className="size-5" />
                    </button>
                    <span className="text-[16px] font-medium text-[var(--max-text)]">
                        Contact info
                    </span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {/* Avatar block */}
                    <div className="flex flex-col items-center gap-3 bg-[var(--max-surface-secondary)] px-6 py-8">
                        {chat.avatarUrl ? (
                            <img
                                src={chat.avatarUrl}
                                alt={chat.name}
                                className="size-40 rounded-full object-cover shadow-md"
                            />
                        ) : (
                            <div className="flex size-40 items-center justify-center rounded-full bg-[var(--max-surface-hover)] text-[var(--max-text-secondary)] shadow-md">
                                {initials ? (
                                    <span className="text-4xl font-medium">{initials}</span>
                                ) : (
                                    <User className="size-16" strokeWidth={1.5} />
                                )}
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-[22px] font-medium text-[var(--max-text)]">{chat.name}</p>
                            <p className="mt-0.5 text-[15px] text-[var(--max-text-secondary)]">{phone}</p>
                            <p className="mt-1 text-[13px] text-[var(--max-text-secondary)]">{lastSeen}</p>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex justify-center gap-8 border-b border-[var(--max-border)] py-5">
                        <button
                            type="button"
                            onClick={onCall}
                            className="flex flex-col items-center gap-1.5 text-[var(--max-primary)] hover:opacity-80"
                        >
                            <div className="flex size-11 items-center justify-center rounded-full bg-[var(--max-primary-soft)]">
                                <Phone className="size-5" />
                            </div>
                            <span className="text-[12px]">Audio</span>
                        </button>
                        <button
                            type="button"
                            onClick={onVideoCall}
                            className="flex flex-col items-center gap-1.5 text-[var(--max-primary)] hover:opacity-80"
                        >
                            <div className="flex size-11 items-center justify-center rounded-full bg-[var(--max-primary-soft)]">
                                <Video className="size-5" />
                            </div>
                            <span className="text-[12px]">Video</span>
                        </button>
                        <button
                            type="button"
                            onClick={onSearch}
                            className="flex flex-col items-center gap-1.5 text-[var(--max-primary)] hover:opacity-80"
                        >
                            <div className="flex size-11 items-center justify-center rounded-full bg-[var(--max-primary-soft)]">
                                <Search className="size-5" />
                            </div>
                            <span className="text-[12px]">Search</span>
                        </button>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                        {[
                            { icon: Image, label: "Media, links and docs" },
                            { icon: Star, label: "Starred messages" },
                            { icon: BellOff, label: "Mute notifications" },
                            { icon: Lock, label: "Encryption", sub: "Messages are end-to-end encrypted" },
                        ].map(({ icon: Icon, label, sub }) => (
                            <button
                                key={label}
                                type="button"
                                className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-[var(--max-surface-secondary)]"
                            >
                                <Icon className="size-5 shrink-0 text-[var(--max-text-secondary)]" />
                                <div>
                                    <p className="text-[15px] text-[var(--max-text)]">{label}</p>
                                    {sub && (
                                        <p className="text-[12px] text-[var(--max-text-secondary)]">{sub}</p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-[var(--max-border)] py-2">
                        <button
                            type="button"
                            onClick={onDeleteChat}
                            className="flex w-full items-center gap-4 px-5 py-3.5 text-left text-[var(--max-danger)] hover:bg-[var(--max-surface-secondary)]"
                        >
                            <Trash2 className="size-5" />
                            <span className="text-[15px]">Delete chat</span>
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    )
}