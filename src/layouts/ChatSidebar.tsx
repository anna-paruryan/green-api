import {useMemo, useRef, useState, type FormEvent, type KeyboardEvent} from "react"
import {AnimatePresence, motion} from "framer-motion"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
    LogOut,
    MessageCirclePlus,
    Search,
    X,
    PanelLeftClose,
    MoreVertical,
    MessageCircle,
} from "lucide-react"
import {useNavigate} from "react-router-dom"
import {useGreenApi} from "../context/GreenApiContext.tsx"
import ChatList from "../components/chat/ChatList.tsx"
import type {Chat} from "../types/chatTypes.ts"

interface ChatSidebarProps {
    chats: Chat[]
    selectedChatId: string | null
    onSelectChat: (id: string) => void
    onStartChat: (phone: string) => void
    onCollapse: () => void
    hideCollapseButton?: boolean
}

const filterTabs = ["All", "Unread", "Favorites", "Groups"] as const
type FilterTab = (typeof filterTabs)[number]

export default function ChatSidebar({
                                        chats,
                                        selectedChatId,
                                        onSelectChat,
                                        onStartChat,
                                        onCollapse,
                                        hideCollapseButton = false,
                                    }: ChatSidebarProps) {
    const navigate = useNavigate()
    const {credentials, disconnect} = useGreenApi()

    const [query, setQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState<FilterTab>("All")
    const [isComposing, setIsComposing] = useState(false)
    const [phone, setPhone] = useState("")

    const filteredChats = useMemo(() => {
        let result = chats

        if (activeFilter === "Unread") {
            result = result.filter((c) => c.unreadCount > 0)
        } else if (activeFilter === "Favorites") {
            result = result.filter((c) => c.isFavorite)
        } else if (activeFilter === "Groups") {
            result = result.filter((c) => c.isGroup)
        }
        const term = query.trim().toLowerCase()
        if (!term) return result

        return result.filter(
            (chat) =>
                chat.name.toLowerCase().includes(term) ||
                chat.id.toLowerCase().includes(term) ||
                (chat.lastMessage?.toLowerCase().includes(term) ?? false),
        )
    }, [chats, query, activeFilter])
    const listContainerRef = useRef<HTMLDivElement>(null)
    const looksLikePhone = (value: string) => {
        const digits = value.replace(/\D/g, "")
        return digits.length >= 8
    }

    const canStartNewChat =
        query.trim().length > 0 &&
        filteredChats.length === 0 &&
        looksLikePhone(query)

    const handleStartFromSearch = () => {
        const clean = query.replace(/\D/g, "")
        if (!clean) return
        onStartChat(clean)
        setQuery("")
    }

    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && canStartNewChat) {
            e.preventDefault()
            handleStartFromSearch()
        }
    }

    const handleToggleCompose = () => {
        setIsComposing((v) => !v)
        setPhone("")
    }

    const handleStartChatForm = (event: FormEvent) => {
        event.preventDefault()
        const trimmed = phone.trim()
        if (!trimmed) return
        onStartChat(trimmed)
        setPhone("")
        setIsComposing(false)
    }

    const handleLogout = () => {
        disconnect()
        navigate("/login", {replace: true})
    }
    const handleSelectChat = (id: string) => {
        onSelectChat(id)
        listContainerRef.current?.scrollTo({top: 0, behavior: "smooth"})
    }
    return (
        <div className="flex h-full min-h-0 flex-col bg-[var(--max-surface)]">
            {/* Header — фиксированный */}
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
                <h1 className="text-[22px] font-semibold text-[var(--max-text)]">Chats</h1>

                <div className="flex items-center gap-1">
                    <Tooltip.Provider delayDuration={200}>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <button
                                    type="button"
                                    onClick={handleToggleCompose}
                                    className={`flex size-9 items-center justify-center rounded-full transition outline-none ${
                                        isComposing
                                            ? "bg-[var(--max-surface-secondary)] text-[var(--max-text)]"
                                            : "bg-[var(--max-primary)] text-[var(--max-text-on-primary)] hover:bg-[var(--max-primary-hover)]"
                                    }`}
                                    aria-label={isComposing ? "Close new chat" : "New chat"}
                                >
                                    {isComposing ? <X className="size-[18px]"/> :
                                        <MessageCirclePlus className="size-[18px]"/>}
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content side="bottom"
                                                 className="rounded-md bg-[var(--max-text)] px-2 py-1 text-xs text-[var(--max-surface)] shadow-md">
                                    {isComposing ? "Close" : "New chat"}
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>

                        {!hideCollapseButton && (
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        type="button"
                                        onClick={onCollapse}
                                        className="flex size-9 items-center justify-center rounded-full text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-secondary)] outline-none"
                                        aria-label="Collapse sidebar"
                                    >
                                        <PanelLeftClose className="size-5"/>
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content side="bottom"
                                                     className="rounded-md bg-[var(--max-text)] px-2 py-1 text-xs text-[var(--max-surface)] shadow-md">
                                        Collapse
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        )}
                    </Tooltip.Provider>
                </div>
            </div>

            {/* Search — фиксированный */}
            <div className="shrink-0 px-3 pb-2">
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--max-text-secondary)]"/>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search or start a new chat"
                        autoComplete="off"
                        className="h-9 w-full rounded-lg border-0 bg-[var(--max-surface-secondary)] pl-9 pr-9 text-sm text-[var(--max-text)] outline-none placeholder:text-[var(--max-text-secondary)] focus:bg-[var(--max-surface)] focus:ring-1 focus:ring-[var(--max-primary)]"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                        >
                            <X className="size-4"/>
                        </button>
                    )}
                </div>
            </div>

            {/* Filter chips — фиксированные */}
            <div className="flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-none">
                {filterTabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveFilter(tab)}
                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition outline-none ${
                            activeFilter === tab
                                ? "bg-[var(--max-primary)] text-[var(--max-text-on-primary)]"
                                : "bg-[var(--max-surface-secondary)] text-[var(--max-text-secondary)] hover:text-[var(--max-text)]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
                <button
                    type="button"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--max-surface-secondary)] text-[var(--max-text-secondary)]"
                    aria-label="More filters"
                >
                    <MoreVertical className="size-4"/>
                </button>
            </div>

            {/* New chat form */}
            <AnimatePresence>
                {isComposing && (
                    <motion.form
                        initial={{height: 0, opacity: 0}}
                        animate={{height: "auto", opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.2}}
                        onSubmit={handleStartChatForm}
                        className="flex shrink-0 items-center gap-2 overflow-hidden border-b border-[var(--max-border)] px-3 pb-3"
                    >
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone number, e.g. 79001234567"
                            inputMode="tel"
                            autoComplete="off"
                            autoFocus
                            className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--max-border)] bg-[var(--max-surface-secondary)] px-3.5 text-sm text-[var(--max-text)] outline-none placeholder:text-[var(--max-text-secondary)] focus:border-[var(--max-primary)] focus:bg-[var(--max-surface)]"
                        />
                        <button
                            type="submit"
                            disabled={!phone.trim()}
                            className="h-10 shrink-0 rounded-lg bg-[var(--max-primary)] px-4 text-sm font-medium text-[var(--max-text-on-primary)] transition hover:bg-[var(--max-primary-hover)] disabled:opacity-40"
                        >
                            Start
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* ===== СПИСОК — единственное место со скроллом ===== */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredChats.length > 0 ? (
                    <ChatList
                        chats={filteredChats}
                        selectedId={selectedChatId}
                        onSelect={handleSelectChat}
                    />
                ) : canStartNewChat ? (
                    <button
                        type="button"
                        onClick={handleStartFromSearch}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--max-surface-secondary)]"
                    >
                        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--max-primary)] text-[var(--max-text-on-primary)]">
                            <MessageCirclePlus className="size-5"/>
                        </div>
                        <div>
                            <p className="text-[16px] font-medium text-[var(--max-text)]">
                                New chat with {query.replace(/\D/g, "")}
                            </p>
                            <p className="text-[13px] text-[var(--max-text-secondary)]">Tap to start conversation</p>
                        </div>
                    </button>
                ) : query.trim() ? (
                    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                        <p className="text-[15px] font-medium text-[var(--max-text)]">No results found</p>
                        <p className="text-[13px] text-[var(--max-text-secondary)]">Try a different name or number</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                        <div
                            className="flex size-12 items-center justify-center rounded-full bg-[var(--max-surface-secondary)] text-[var(--max-text-secondary)]">
                            <MessageCircle className="size-5"/>
                        </div>
                        <p className="text-[15px] font-medium text-[var(--max-text)]">No conversations yet</p>
                        <p className="text-[13px] text-[var(--max-text-secondary)]">Search or start a new chat</p>
                    </div>
                )}
            </div>

            {/* Footer — фиксированный */}
            <div className="mt-auto flex shrink-0 items-center justify-between border-t border-[var(--max-border)] px-4 py-3">
                <div className="min-w-0">
                    <p className="text-xs text-[var(--max-text-secondary)]">Connected as</p>
                    <p className="truncate text-sm font-medium text-[var(--max-text)]">
                        {credentials?.idInstance}
                    </p>
                </div>
                <Tooltip.Provider delayDuration={200}>
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-secondary)] outline-none"
                                aria-label="Disconnect"
                            >
                                <LogOut className="size-[18px]"/>
                            </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content side="top"
                                             className="rounded-md bg-[var(--max-text)] px-2 py-1 text-xs text-[var(--max-surface)] shadow-md">
                                Disconnect
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
            </div>
        </div>
    )
}