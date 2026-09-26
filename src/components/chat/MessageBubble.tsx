import { useState } from "react"
import type { ChatMessage } from "../../types/chatTypes.ts"
import { formatMessageTime } from "../../utils/formatTime.ts"
import {
    CheckCheck,
    Download,
    FileText,
    ChevronDown,
    Info,
    Reply,
    Copy,
    Forward,
    Pin,
    Sparkles,
    Star,
    CheckSquare,
    Trash2,
    SmilePlus,
} from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

export default function MessageBubble({
                                          message,
                                          onDelete,
                                      }: {
    message: ChatMessage
    onDelete: () => void
}) {
    const isOutgoing = message.direction === "out"
    const hasMedia = Boolean(message.mediaUrl)
    const hasText = Boolean(message.text?.trim())
    const [menuOpen, setMenuOpen] = useState(false)

    const handleDownload = async () => {
        if (!message.mediaUrl) return
        try {
            const res = await fetch(message.mediaUrl)
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = message.fileName || "file"
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            window.open(message.mediaUrl, "_blank")
        }
    }

    return (
        <div className={`group flex w-full px-3 py-[2px] ${isOutgoing ? "justify-end" : "justify-start"}`}>
            <div
                className={`
                    relative
                    max-w-[85%]
                    sm:max-w-[70%]
                    overflow-hidden
                    rounded-[var(--max-message-radius)]
                    shadow-[var(--max-message-shadow)]
                    ${
                    isOutgoing
                        ? `bg-[var(--max-message-outgoing)] rounded-br-[4px]`
                        : `bg-[var(--max-message-incoming)] rounded-bl-[4px]`
                }
                `}
            >
                {/* Триггер меню — шеврон в углу пузыря */}
                <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
                    <DropdownMenu.Trigger asChild>
                        <button
                            type="button"
                            className={`
                                absolute right-1 top-1 z-10
                                flex size-6 items-center justify-center rounded-full
                                text-[var(--max-text-secondary)]
                                bg-[var(--max-surface)]/70 backdrop-blur-sm
                                transition-opacity
                                ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                            `}
                            aria-label="Message options"
                        >
                            <ChevronDown className="size-4" />
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            align="end"
                            sideOffset={4}
                            className="z-50 w-[220px] overflow-hidden rounded-xl border border-[var(--max-border)] bg-[var(--max-surface)] shadow-xl"
                        >
                            {/* Панель быстрых реакций — визуальная заглушка, не работает */}
                            <div className="flex items-center justify-between gap-0.5 border-b border-[var(--max-divider)] px-2 py-2">
                                {QUICK_REACTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        disabled
                                        className="flex size-8 cursor-not-allowed items-center justify-center rounded-full text-base opacity-40"
                                        title="Coming soon"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled
                                    className="flex size-8 cursor-not-allowed items-center justify-center rounded-full text-[var(--max-text-secondary)] opacity-40"
                                    title="Coming soon"
                                >
                                    <SmilePlus className="size-[18px]" />
                                </button>
                            </div>

                            {/* Список действий — все, кроме Delete, задизейблены */}
                            <div className="py-1">
                                <DropdownMenu.Item
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-text-muted)] outline-none"
                                >
                                    <Info className="size-4" />
                                    Message info
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-text-muted)] outline-none"
                                >
                                    <Reply className="size-4" />
                                    Reply
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-text-muted)] outline-none"
                                >
                                    <Copy className="size-4" />
                                    Copy
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-text-muted)] outline-none"
                                >
                                    <Forward className="size-4" />
                                    Forward
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-text-muted)] outline-none"
                                >
                                    <Pin className="size-4" />
                                    Pin
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-text-muted)] outline-none"
                                >
                                    <Sparkles className="size-4" />
                                    Ask Meta AI
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-text-muted)] outline-none"
                                >
                                    <Star className="size-4" />
                                    Star
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-text-muted)] outline-none"
                                >
                                    <CheckSquare className="size-4" />
                                    Select
                                </DropdownMenu.Item>

                                <DropdownMenu.Separator className="my-1 h-px bg-[var(--max-divider)]" />

                                {/* Единственный рабочий пункт */}
                                <DropdownMenu.Item
                                    onSelect={() => onDelete()}
                                    className="flex cursor-pointer items-center gap-3 px-3.5 py-2 text-sm text-[var(--max-danger)] outline-none data-[highlighted]:bg-[var(--max-surface-secondary)]"
                                >
                                    <Trash2 className="size-4" />
                                    Delete
                                </DropdownMenu.Item>
                            </div>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                {/* IMAGE */}
                {message.mediaUrl && message.mediaType === "image" && (
                    <div className="relative">
                        <img
                            src={message.mediaUrl}
                            alt={message.fileName ?? "image"}
                            className="block max-h-[400px] max-w-[360px] cursor-pointer object-cover"
                            loading="lazy"
                            onClick={handleDownload}
                        />
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="absolute right-2 top-2 hidden size-8 items-center justify-center rounded-full bg-[var(--max-overlay-dark)] text-[var(--max-text-on-primary)] backdrop-blur group-hover:flex"
                        >
                            <Download className="size-4" />
                        </button>
                    </div>
                )}

                {/* VIDEO */}
                {message.mediaUrl && message.mediaType === "video" && (
                    <video src={message.mediaUrl} controls className="block max-h-[400px] max-w-[360px]" />
                )}

                {/* AUDIO */}
                {message.mediaUrl && message.mediaType === "audio" && (
                    <div className="p-2">
                        <audio src={message.mediaUrl} controls className="max-w-[300px]" />
                    </div>
                )}

                {/* DOCUMENT */}
                {message.mediaUrl && message.mediaType === "document" && (
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="flex w-full min-w-[260px] items-center gap-3 bg-[var(--max-surface-secondary)] p-3 text-left hover:bg-[var(--max-surface-hover)]"
                    >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-[var(--max-primary)] text-[var(--max-text-on-primary)]">
                            <FileText className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-[var(--max-text)]">
                                {message.fileName ?? "file"}
                            </p>
                            <p className="text-[12px] text-[var(--max-text-secondary)]">Click to download</p>
                        </div>
                        <Download className="size-4 shrink-0 text-[var(--max-text-secondary)]" />
                    </button>
                )}

                {/* TEXT */}
                {hasText && (
                    <p className="whitespace-pre-wrap break-words px-3 pb-1 pt-2 text-[14px] leading-[1.4] text-[var(--max-text)] pr-6">
                        {message.text}
                    </p>
                )}

                {/* TIME */}
                <div
                    className={`flex items-center justify-end gap-1 ${
                        hasText ? "px-2 pb-1" : "absolute bottom-1 right-1"
                    }`}
                >
                    <span
                        className={`whitespace-nowrap text-[11px] leading-none tabular-nums ${
                            hasMedia && !hasText
                                ? "rounded-full bg-[var(--max-overlay-dark)] px-1.5 py-1 text-[var(--max-text-on-primary)]"
                                : "text-[var(--max-message-time)]"
                        }`}
                    >
                        {formatMessageTime(message.timestamp)}
                    </span>

                    {isOutgoing && (
                        <span className="text-[11px] leading-none text-[var(--max-message-check)]">
                            <CheckCheck className="size-4 shrink-0" strokeWidth={2} />
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}