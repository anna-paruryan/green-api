import { useEffect, useRef } from "react"
import { useOutletContext } from "react-router-dom"
import { motion } from "motion/react"
import { MessageCircle } from "lucide-react"
import ChatHeader from "../../components/chat/ChatHeader.tsx"
import MessageBubble from "../../components/chat/MessageBubble.tsx"
import MessageInput from "../../components/chat/MessageInput.tsx"
import type {ChatOutletContext} from "../../layouts/ChatLayout.tsx";

export default function ChatPage() {
    const { chats, selectedChatId, onSend, onBack, onDeleteChat, onDeleteMessage } =
        useOutletContext<ChatOutletContext>()
    const activeChat = chats.find((chat) => chat.id === selectedChatId) ?? null

    const bottomRef = useRef<HTMLDivElement>(null)
    const messagesCount = activeChat?.messages.length ?? 0

    // автоскролл к последнему сообщению при: открытии чата, отправке своего
    // сообщения, получении нового входящего — то есть при любом изменении
    // количества сообщений в активном чате
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [selectedChatId, messagesCount])

    if (!activeChat) {
        return (
            <div className="flex h-full min-w-0 flex-1 flex-col bg-[var(--max-bg)]">
                <header className="hidden h-16 shrink-0 items-center border-b border-[var(--max-divider)] bg-[var(--max-surface)] px-4 sm:px-6 md:flex">
                    <div>
                        <h1 className="text-base font-semibold text-[var(--max-text)]">
                            Messages
                        </h1>
                        <p className="text-xs text-[var(--max-text-secondary)]">
                            Select a chat to start messaging
                        </p>
                    </div>
                </header>

                <section className="flex min-h-0 flex-1 items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex max-w-sm flex-col items-center text-center"
                    >
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-[var(--max-primary-soft)] text-[var(--max-primary)]">
                            <MessageCircle className="size-7" />
                        </div>

                        <h2 className="text-lg font-semibold text-[var(--max-text)]">
                            Your messages
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[var(--max-text-secondary)]">
                            Select an existing chat or create a new conversation to
                            start messaging.
                        </p>
                    </motion.div>
                </section>
            </div>
        )
    }
    const handleSend = (data: { text: string; file?: File }) => {
        onSend(data)
    }
    return (
        <div className="flex h-full min-w-0 flex-1 flex-col bg-[var(--max-bg)]">
            <ChatHeader
                chat={activeChat}
                onBack={onBack}
                onDeleteChat={() => onDeleteChat(activeChat.id)}
            />

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 sm:px-6">
                {activeChat.messages.length === 0 ? (
                    <p className="m-auto text-sm text-[var(--max-text-muted)]">
                        No messages yet — say hello.
                    </p>
                ) : (
                    activeChat.messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            onDelete={() => onDeleteMessage(message.id)}
                        />
                    ))
                )}
                {/* Якорь для автоскролла — всегда последний элемент списка */}
                <div ref={bottomRef} />
            </div>

            <MessageInput onSend={handleSend} />
        </div>
    )
}