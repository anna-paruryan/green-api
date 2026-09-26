import {useRef, useEffect, useMemo, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Send, Smile, Paperclip, Mic, X} from "lucide-react"
import {motion, AnimatePresence} from "framer-motion"
import EmojiPicker, { Theme } from "emoji-picker-react"
import type { EmojiClickData } from "emoji-picker-react"
import {
    chatInputSchema,
    type ChatInputValues,
} from "../../schemas/credentials.schema.ts"

interface MessageInputProps {
    onSend: (data: { text: string; file?: File }) => void
}

export default function MessageInput({onSend}: MessageInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef<HTMLDivElement>(null)
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: {errors},
    } = useForm<ChatInputValues>({
        resolver: zodResolver(chatInputSchema),
        defaultValues: {text: ""},
    })

    const textValue = watch("text")
    const fileValue = watch("file")
    const { ref: formRef, ...textRegister } = register("text")
    useEffect(() => {
        if (!showEmojiPicker) return
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [showEmojiPicker])

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        const current = textValue || ""
        setValue("text", current + emojiData.emoji)
        textareaRef.current?.focus()
    }
    useEffect(() => {
        const el = textareaRef.current

        if (!el) return

        el.style.height = "auto"
        el.style.height = `${Math.min(el.scrollHeight, 128)}px`
    }, [textValue])

    const onSubmit = (data: ChatInputValues) => {
        onSend({
            text: data.text?.trim() || "",
            file: data.file,
        })

        reset()

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }
    }

    const hasText = Boolean(textValue?.trim() || fileValue)
    const filePreviewUrl = useMemo(() => {
        if (fileValue && fileValue.type.startsWith("image/")) {
            return URL.createObjectURL(fileValue)
        }
        return null
    }, [fileValue])

    useEffect(() => {
        return () => {
            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
        }
    }, [filePreviewUrl])
    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex shrink-0 flex-col border-t border-[var(--max-border)] bg-[var(--max-surface-secondary)] px-3 py-2.5"
        >
            {/* File preview */}
            <AnimatePresence>
                {fileValue && (
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 10}}
                        className="mb-2 inline-flex max-w-xs items-center gap-2 self-start rounded-[var(--max-radius-md)] bg-[var(--max-surface)] p-2 shadow-[var(--max-shadow)]"
                    >
                        {filePreviewUrl ? (
                            <img
                                src={filePreviewUrl}
                                alt={fileValue.name}
                                className="size-12 shrink-0 rounded-[var(--max-radius-sm)] object-cover"
                            />
                        ) : (
                            <div
                                className="flex size-12 shrink-0 items-center justify-center rounded-[var(--max-radius-sm)] bg-[var(--max-surface-secondary)] text-[var(--max-text-secondary)]">
                                <Paperclip className="size-5"/>
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[var(--max-text)]">
                                {fileValue.name}
                            </p>
                            <p className="text-xs text-[var(--max-text-secondary)]">
                                {(fileValue.size / 1024).toFixed(0)} KB
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setValue("file", undefined)}
                            className="shrink-0 rounded-full p-1 hover:bg-[var(--max-surface-hover)]"
                        >
                            <X className="size-4 text-[var(--max-text-secondary)]"/>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-end gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) =>
                        setValue("file", e.target.files?.[0])
                    }
                />

                {/* Attachment button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-hover)] hover:text-[var(--max-text)]"
                >
                    <Paperclip className="size-5"/>
                </button>

                {/* Input field */}
                <div
                    className="relative flex min-h-10 flex-1 items-end rounded-[var(--max-radius-lg)] bg-[var(--max-surface)] shadow-[var(--max-shadow)]"
                >
    <textarea
        {...textRegister}
        ref={(e) => {
            formRef(e)
            textareaRef.current = e
        }}
        placeholder="Type a message"
        rows={1}
        onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(onSubmit)()
            }
        }}
        className="max-h-32 min-h-10 w-full resize-none rounded-[var(--max-radius-lg)] bg-transparent px-4 py-2.5 pr-12 leading-5 text-[var(--max-text)] outline-none placeholder:text-[var(--max-text-secondary)] focus:outline-none focus:ring-0"
        style={{height: "40px"}}
    />

                    <div className="absolute bottom-1.5 right-2" ref={emojiPickerRef}>
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker((v) => !v)}
                            className="flex size-8 items-center justify-center rounded-full text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-hover)] hover:text-[var(--max-text)]"
                            aria-label="Emoji"
                        >
                            <Smile className="size-5"/>
                        </button>

                        {showEmojiPicker && (
                            <div className="absolute bottom-12 right-0 z-50">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    theme={Theme.LIGHT}
                                    width={320}
                                    height={400}
                                    searchDisabled={false}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Send / Mic */}
                <AnimatePresence mode="wait" initial={false}>
                    {hasText ? (
                        <motion.button
                            key="send"
                            initial={{scale: 0.6}}
                            animate={{scale: 1}}
                            exit={{scale: 0.6}}
                            type="submit"
                            className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--max-primary)] text-[var(--max-text-on-primary)] shadow-[var(--max-shadow)] transition hover:bg-[var(--max-primary-hover)]"
                            aria-label="Send message"
                        >
                            <Send className="size-5"/>
                        </motion.button>
                    ) : (
                        <motion.button
                            key="mic"
                            initial={{scale: 0.6}}
                            animate={{scale: 1}}
                            exit={{scale: 0.6}}
                            type="button"
                            className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--max-text-secondary)] transition hover:bg-[var(--max-surface-hover)] hover:text-[var(--max-text)]"
                            aria-label="Voice message"
                        >
                            <Mic className="size-5"/>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {errors.text && (
                <p className="mt-1 px-1 text-xs text-[var(--max-danger)]">
                    {errors.text.message}
                </p>
            )}
        </form>
    )
}

