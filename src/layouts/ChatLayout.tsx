import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import {
    MessageSquare,
    Phone,
    CircleDot,
    Users,
    Archive,
    Settings,
    Star,
    PanelLeftOpen,
    Megaphone,
} from "lucide-react"
import * as Tooltip from "@radix-ui/react-tooltip"
import ChatSidebar from "./ChatSidebar.tsx"
import { useChatsStore } from "../hooks/useChatsStore.ts"
import { useMediaQuery } from "../hooks/useMediaQuery.ts"
import type { Chat } from "../types/chatTypes.ts"

export interface ChatOutletContext {
    chats: Chat[]
    selectedChatId: string | null
    onSend: (data: { text: string; file?: File }) => void
    onBack: () => void
    hideCollapseButton?: boolean
    onDeleteChat: (chatId: string) => void
    onDeleteMessage: (messageId: string) => void
}

const navItems = [
    { id: "chats", icon: MessageSquare, label: "Chats" },
    { id: "calls", icon: Phone, label: "Calls" },
    { id: "status", icon: CircleDot, label: "Status" },
    { id: "channels", icon: Megaphone, label: "Channels" },
    { id: "communities", icon: Users, label: "Communities" },
] as const

type NavId = (typeof navItems)[number]["id"]

const SIDEBAR_WIDTH = 400
const COLLAPSED_RAIL_WIDTH = 48
const SPRING = { type: "spring", stiffness: 380, damping: 36 } as const

export default function ChatLayout() {
    const {
        chats,
        selectedChatId,
        setSelectedChatId,
        startChat,
        sendMessage,
        loadChatHistory,
        sendMedia,
        deleteMessage,
        markChatAsRead,
        deleteChat,
    } = useChatsStore()

    const isMobile = useMediaQuery("(max-width: 767px)")

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [activeNav, setActiveNav] = useState<NavId>("chats")

    const hasSelection = selectedChatId !== null && activeNav === "chats"
    const showSidebar = isMobile ? !hasSelection : true
    const showMain = isMobile ? hasSelection : true

    useEffect(() => {
        if (isMobile) setIsSidebarCollapsed(false)
    }, [isMobile])

    const handleSelectChat = (id: string) => {
        setSelectedChatId(id)
        void loadChatHistory(id)
        void loadChatHistory(id)
        void markChatAsRead(id)
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[var(--max-bg)]">
            {!isMobile && (
                <aside className="flex w-[60px] shrink-0 flex-col items-center border-r border-[var(--max-border)] bg-[var(--max-surface)] py-3">
                    <Tooltip.Provider delayDuration={200}>
                        <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-[var(--max-primary)] text-[var(--max-text-on-primary)]">
                            <MessageSquare className="size-5" />
                        </div>

                        <nav className="flex flex-1 flex-col items-center gap-1">
                            {navItems.map(({ id, icon: Icon, label }) => (
                                <Tooltip.Root key={id}>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveNav(id)
                                                if (id !== "chats") setSelectedChatId(null)
                                                if (isSidebarCollapsed) setIsSidebarCollapsed(false)
                                            }}
                                            className={`relative flex size-11 items-center justify-center rounded-xl transition outline-none ${
                                                activeNav === id
                                                    ? "bg-[var(--max-primary-soft)] text-[var(--max-primary)]"
                                                    : "text-[var(--max-text-secondary)] hover:bg-[var(--max-surface-secondary)]"
                                            }`}
                                            aria-label={label}
                                        >
                                            <Icon className="size-5" strokeWidth={activeNav === id ? 2.25 : 1.75} />
                                            {activeNav === id && (
                                                <motion.span
                                                    layoutId="nav-indicator"
                                                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--max-primary)]"
                                                />
                                            )}
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            side="right"
                                            sideOffset={8}
                                            className="z-50 rounded-md bg-[var(--max-text)] px-2.5 py-1.5 text-xs text-[var(--max-surface)] shadow-md"
                                        >
                                            {label}
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            ))}
                        </nav>

                        <div className="mt-auto flex flex-col items-center gap-1">
                            {[
                                { icon: Archive, label: "Archived" },
                                { icon: Star, label: "Starred" },
                                { icon: Settings, label: "Settings" },
                            ].map(({ icon: Icon, label }) => (
                                <Tooltip.Root key={label}>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            type="button"
                                            className="flex size-11 items-center justify-center rounded-xl text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-secondary)] outline-none"
                                            aria-label={label}
                                        >
                                            <Icon className="size-5" />
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            side="right"
                                            sideOffset={8}
                                            className="z-50 rounded-md bg-[var(--max-text)] px-2.5 py-1.5 text-xs text-[var(--max-surface)] shadow-md"
                                        >
                                            {label}
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            ))}
                        </div>
                    </Tooltip.Provider>
                </aside>
            )}

            {/*
              ===== SIDEBAR =====

            */}
            {showSidebar && (
                <motion.div
                    animate={{
                        width: isMobile ? "100%" : (isSidebarCollapsed ? 0 : SIDEBAR_WIDTH),
                    }}
                    initial={false}
                    transition={SPRING}
                    className="h-full shrink-0 overflow-hidden border-r border-[var(--max-border)] bg-[var(--max-surface)]"
                    style={{ willChange: "width" }}
                >
                    <div className="flex h-full flex-col" style={{ width: isMobile ? "100%" : SIDEBAR_WIDTH }}>
                        {activeNav === "chats" ? (
                            <ChatSidebar
                                chats={chats}
                                selectedChatId={selectedChatId}
                                onSelectChat={handleSelectChat}
                                onStartChat={startChat}
                                onCollapse={isMobile ? () => {} : () => setIsSidebarCollapsed(true)}
                                hideCollapseButton={isMobile}
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                                <p className="text-[15px] font-medium text-[var(--max-text)]">
                                    {navItems.find((n) => n.id === activeNav)?.label}
                                </p>
                                <p className="text-[13px] text-[var(--max-text-secondary)]">Coming soon</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/*
              Collapsed toggle rail
            */}
            {!isMobile && (
                <motion.div
                    animate={{ width: isSidebarCollapsed ? COLLAPSED_RAIL_WIDTH : 0 }}
                    initial={false}
                    transition={SPRING}
                    className="h-full shrink-0 overflow-hidden border-r border-[var(--max-border)] bg-[var(--max-surface)]"
                    style={{ willChange: "width" }}
                >
                    <div className="flex h-full flex-col items-center pt-3" style={{ width: COLLAPSED_RAIL_WIDTH }}>
                        <Tooltip.Provider delayDuration={200}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setIsSidebarCollapsed(false)}
                                        className="flex size-10 items-center justify-center rounded-full text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-secondary)]"
                                        aria-label="Expand sidebar"
                                    >
                                        <PanelLeftOpen className="size-5" />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        side="right"
                                        sideOffset={8}
                                        className="z-50 rounded-md bg-[var(--max-text)] px-2.5 py-1.5 text-xs text-[var(--max-surface)] shadow-md"
                                    >
                                        Expand chats
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>
                </motion.div>
            )}

            {/* ===== MAIN ===== */}
            {showMain && (
                <main className="flex min-w-0 flex-1 overflow-hidden">
                    {activeNav === "chats" ? (
                        <Outlet
                            context={
                                {
                                    chats,
                                    selectedChatId,
                                    onSend: (data: { text: string; file?: File }) => {
                                        if (!selectedChatId) return
                                        if (data.file) void sendMedia(selectedChatId, data.file, data.text)
                                        else if (data.text.trim()) void sendMessage(selectedChatId, data.text)
                                    },
                                    onBack: () => setSelectedChatId(null),
                                    onDeleteChat: deleteChat,
                                    onDeleteMessage: (messageId: string) => {
                                        if (!selectedChatId) return
                                        void deleteMessage(selectedChatId, messageId)
                                    },
                                } satisfies ChatOutletContext
                            }
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--max-bg)] text-[var(--max-text-secondary)]">
                            <p className="text-sm">Coming soon</p>
                        </div>
                    )}
                </main>
            )}
        </div>
    )
}