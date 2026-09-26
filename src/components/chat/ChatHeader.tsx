import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
    ArrowLeft,
    User,
    Phone,
    Search,
    MoreVertical,
    X,
    Video,
    BellOff,
    Trash2,
    Info,
} from "lucide-react"
import { toast } from "sonner"
import type { Chat } from "../../types/chatTypes.ts"
import { formatMessageTime } from "../../utils/formatTime.ts"
import CallOverlay from "./CallOverlay.tsx"
import ContactInfoDrawer from "./ContactInfoDrawer.tsx"
import { formatLastSeen } from "../../utils/formatLastSeen.ts"

interface ChatHeaderProps {
    chat: Chat
    onBack: () => void
    onDeleteChat: (chatId: string) => void
}

function getInitials(value: string): string | null {
    const trimmed = value.trim()
    if (!trimmed) return null
    if (/^[\d\s+\-()]+$/.test(trimmed)) return null
    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return trimmed.slice(0, 2).toUpperCase()
}

export default function ChatHeader({ chat, onBack, onDeleteChat }: ChatHeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [infoOpen, setInfoOpen] = useState(false)
    const [callOpen, setCallOpen] = useState(false)
    const [isVideoCall, setIsVideoCall] = useState(false)

    const initials = getInitials(chat.name)
    const lastSeenText = chat.lastMessageAt
        ? formatLastSeen(chat.lastMessageAt)
        : "tap for contact info"
    const searchResults =
        searchQuery.trim().length > 0
            ? chat.messages.filter((m) =>
                m.text.toLowerCase().includes(searchQuery.trim().toLowerCase()),
            )
            : []

    const handleDeleteChat = () => {
        toast("Delete chat?", {
            description: `Remove ${chat.name} from your chat list?`,
            action: {
                label: "Delete",
                onClick: () => {
                    onDeleteChat(chat.id)
                    setInfoOpen(false)
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => {},
            },
        })
    }

    return (
        <div className="relative shrink-0">
            <motion.header
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-[60px] items-center gap-3 border-b border-[var(--max-border)] bg-[var(--max-surface-secondary)] px-3 sm:px-4"
            >
                <button
                    type="button"
                    onClick={onBack}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-hover)] md:hidden"
                    aria-label="Back"
                >
                    <ArrowLeft className="size-5" />
                </button>

                <button
                    type="button"
                    onClick={() => setInfoOpen(true)}
                    className="shrink-0 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--max-primary)]"
                >
                    {chat.avatarUrl ? (
                        <img
                            src={chat.avatarUrl}
                            alt={chat.name}
                            className="size-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-[var(--max-surface-hover)] text-[var(--max-text-secondary)]">
                            {initials ? (
                                <span className="text-sm font-medium">{initials}</span>
                            ) : (
                                <User className="size-5" strokeWidth={1.75} />
                            )}
                        </div>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setInfoOpen(true)}
                    className="min-w-0 flex-1 text-left"
                >
                    <p className="truncate text-[16px] font-medium text-[var(--max-text)]">
                        {chat.name}
                    </p>
                    <p className="truncate text-[13px] text-[var(--max-text-secondary)]">{lastSeenText}</p>
                </button>

                <div className="flex shrink-0 items-center">
                    <button
                        type="button"
                        onClick={() => {
                            setSearchOpen(true)
                            setSearchQuery("")
                        }}
                        className="flex size-10 items-center justify-center rounded-full text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-hover)]"
                        aria-label="Search messages"
                    >
                        <Search className="size-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setIsVideoCall(false)
                            setCallOpen(true)
                        }}
                        className="flex size-10 items-center justify-center rounded-full text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-hover)]"
                        aria-label="Voice call"
                    >
                        <Phone className="size-5" />
                    </button>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                className="flex size-10 items-center justify-center rounded-full text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-hover)] outline-none"
                                aria-label="More"
                            >
                                <MoreVertical className="size-5" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={4}
                                className="z-50 min-w-[180px] rounded-lg border border-[var(--max-border)] bg-[var(--max-surface)] py-1 shadow-lg"
                            >
                                <DropdownMenu.Item
                                    onSelect={() => setInfoOpen(true)}
                                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[var(--max-text)] outline-none data-[highlighted]:bg-[var(--max-surface-secondary)]"
                                >
                                    <Info className="size-4 text-[var(--max-text-secondary)]" />
                                    Contact info
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onSelect={() => {
                                        setIsVideoCall(true)
                                        setCallOpen(true)
                                    }}
                                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[var(--max-text)] outline-none data-[highlighted]:bg-[var(--max-surface-secondary)]"
                                >
                                    <Video className="size-4 text-[var(--max-text-secondary)]" />
                                    Video call
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onSelect={() => setSearchOpen(true)}
                                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[var(--max-text)] outline-none data-[highlighted]:bg-[var(--max-surface-secondary)]"
                                >
                                    <Search className="size-4 text-[var(--max-text-secondary)]" />
                                    Search
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[var(--max-text)] outline-none data-[highlighted]:bg-[var(--max-surface-secondary)]">
                                    <BellOff className="size-4 text-[var(--max-text-secondary)]" />
                                    Mute
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="my-1 h-px bg-[var(--max-divider)]" />
                                <DropdownMenu.Item
                                    onSelect={handleDeleteChat}
                                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[var(--max-danger)] outline-none data-[highlighted]:bg-[var(--max-surface-secondary)]"
                                >
                                    <Trash2 className="size-4" />
                                    Delete chat
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </motion.header>

            {/* Search panel */}
            <AnimatePresence>
                {searchOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-[var(--max-overlay-dark)]"
                            onClick={() => setSearchOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 400, damping: 36 }}
                            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[380px] flex-col bg-[var(--max-surface)] shadow-2xl"
                        >
                            <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-[var(--max-border)] px-4">
                                <button
                                    type="button"
                                    onClick={() => setSearchOpen(false)}
                                    className="flex size-9 items-center justify-center rounded-full text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-secondary)]"
                                >
                                    <X className="size-5" />
                                </button>
                                <span className="text-[16px] font-medium text-[var(--max-text)]">
                                    Search messages
                                </span>
                            </div>
                            <div className="shrink-0 px-4 py-3">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--max-text-secondary)]" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search"
                                        autoFocus
                                        className="h-10 w-full rounded-lg bg-[var(--max-surface-secondary)] pl-9 pr-3 text-sm text-[var(--max-text)] outline-none placeholder:text-[var(--max-text-secondary)] focus:ring-1 focus:ring-[var(--max-primary)]"
                                    />
                                </div>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto">
                                {!searchQuery.trim() ? (
                                    <p className="px-6 py-12 text-center text-sm text-[var(--max-text-secondary)]">
                                        Search for messages with {chat.name}
                                    </p>
                                ) : searchResults.length === 0 ? (
                                    <p className="px-6 py-12 text-center text-sm text-[var(--max-text-secondary)]">
                                        No messages found
                                    </p>
                                ) : (
                                    searchResults.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className="border-b border-[var(--max-divider)] px-4 py-3 hover:bg-[var(--max-surface-secondary)]"
                                        >
                                            <p className="line-clamp-2 text-sm text-[var(--max-text)]">
                                                {msg.text}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--max-text-secondary)]">
                                                {formatMessageTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Contact info drawer */}
            <AnimatePresence>
                {infoOpen && (
                    <ContactInfoDrawer
                        chat={chat}
                        onClose={() => setInfoOpen(false)}
                        onCall={() => {
                            setInfoOpen(false)
                            setIsVideoCall(false)
                            setCallOpen(true)
                        }}
                        onVideoCall={() => {
                            setInfoOpen(false)
                            setIsVideoCall(true)
                            setCallOpen(true)
                        }}
                        onSearch={() => {
                            setInfoOpen(false)
                            setSearchOpen(true)
                        }}
                        onDeleteChat={handleDeleteChat}
                    />
                )}
            </AnimatePresence>

            {/* Call overlay */}
            <AnimatePresence>
                {callOpen && (
                    <CallOverlay
                        chat={chat}
                        isVideo={isVideoCall}
                        onEnd={() => setCallOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}