import { MessageCircle } from "lucide-react"
import ChatItem from "./ChatItem.tsx"
import type { Chat } from "../../types/chatTypes.ts"

interface ChatListProps {
    chats: Chat[]
    selectedId: string | null
    onSelect: (id: string) => void
}

export default function ChatList({ chats, selectedId, onSelect }: ChatListProps) {
    if (chats.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-[var(--max-surface-secondary)] text-[var(--max-text-secondary)]">
                    <MessageCircle className="size-5" />
                </div>
                <p className="text-[15px] font-medium text-[var(--max-text)]">No conversations yet</p>
                <p className="text-[13px] leading-5 text-[var(--max-text-secondary)]">
                    Search or start a new chat
                </p>
            </div>
        )
    }

    return (
        <div className="@container flex min-h-0 flex-1 flex-col overflow-y-auto">

            <div className="sticky top-0 z-10 bg-[var(--max-surface)] px-4 pb-1 pt-3">
                <p className="text-[16px] font-medium text-[var(--max-text)]">Chats</p>
            </div>

            <div className="flex flex-col">
                {chats.map((chat) => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        active={chat.id === selectedId}
                        onClick={() => onSelect(chat.id)}
                    />
                ))}
            </div>
        </div>
    )
}