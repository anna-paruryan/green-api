import { motion } from "framer-motion"
import {  CheckCheck } from "lucide-react"
import ChatAvatar from "./ChatAvatar.tsx"
import type { Chat } from "../../types/chatTypes.ts"
import {formatListTime} from "../../utils/formatTime.ts";

interface ChatItemProps {
    chat: Chat
    active: boolean
    onClick: () => void
}



export default function ChatItem({ chat, active, onClick }: ChatItemProps) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileTap={{ scale: 0.995 }}
            className={`flex w-full items-center gap-3 px-3 py-3 text-left transition outline-none ${
                active
                    ? "bg-[var(--max-surface-hover)]"
                    : "hover:bg-[var(--max-surface-secondary)]"
            }`}
        >
            <ChatAvatar name={chat.name} avatarUrl={chat.avatarUrl} size={49} />

            <div className="min-w-0 flex-1 border-b border-[var(--max-divider)] pb-3">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[17px] font-medium text-[var(--max-text)]">
                        {chat.name}
                    </p>
                    <span className="shrink-0 text-[12px] text-[var(--max-text-secondary)]">
            {chat.lastMessageAt ? formatListTime(chat.lastMessageAt) : ""}
          </span>
                </div>

                <div className="mt-0.5 flex items-center gap-1">
                    {chat.lastMessage && (
                        <CheckCheck className="size-4 shrink-0 text-[var(--max-message-check)]" strokeWidth={2} />
                    )}
                    <p className="truncate text-[14px] text-[var(--max-text-secondary)]">
                        {chat.lastMessage || "No messages yet"}
                    </p>
                </div>
            </div>
        </motion.button>
    )
}