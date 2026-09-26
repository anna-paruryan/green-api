
import {useCallback, useEffect, useRef, useState} from "react"
import type {Chat, ChatMessage} from "../types/chatTypes.ts"
import {
    loadChats,
    saveChats,
    loadSelectedChatId,
    saveSelectedChatId,
    mergeChats,
} from "../lib/chatsStorage.ts"
import {useGreenApi} from "../context/GreenApiContext.tsx"
type GreenChatItem = {
    id?: string
    name?: string
    type?: string
    unreadCount?: number
}
type GreenHistoryItem = {
    idMessage?: string
    type?: string
    typeMessage?: string
    timestamp?: number
    textMessage?: string
    caption?: string
    downloadUrl?: string
    urlFile?: string
    fileName?: string
    mimeType?: string
    extendedTextMessage?: { text?: string }
    fileMessageData?: { downloadUrl?: string }
}
const SAVE_DEBOUNCE_MS = 300
const POLL_INTERVAL_MS = 2500

function resolveMediaType(input: string): ChatMessage["mediaType"] {
    const v = input.toLowerCase()
    if (v.includes("image") || v === "imagemessage") return "image"
    if (v.includes("video") || v === "videomessage") return "video"
    if (v.includes("audio") || v === "audiomessage") return "audio"
    return "document"
}

export function useChatsStore() {
    const {credentials} = useGreenApi()
    const [chats, setChats] = useState<Chat[]>(() => loadChats())
    const [selectedChatId, setSelectedChatIdState] = useState<string | null>(() => loadSelectedChatId())
    const [isHydrating, setIsHydrating] = useState(false)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => saveChats(chats), SAVE_DEBOUNCE_MS)
        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current)
        }
    }, [chats])

    useEffect(() => {
        saveSelectedChatId(selectedChatId)
    }, [selectedChatId])

    const setSelectedChatId = useCallback((id: string | null) => setSelectedChatIdState(id), [])

    // Hydrate
    useEffect(() => {
        if (!credentials?.idInstance || !credentials?.apiTokenInstance) return
        let cancelled = false

        async function hydrate() {
            setIsHydrating(true)
            try {
                const res = await fetch(`https://api.green-api.com/waInstance${credentials!.idInstance}/getChats/${credentials!.apiTokenInstance}`)
                if (!res.ok || cancelled) return
                const data = (await res.json()) as GreenChatItem[]
                if (!Array.isArray(data) || cancelled) return

                const remote: Chat[] = data
                    .filter((item) => {
                        const rawId = String(item.id ?? "")
                        return rawId && rawId !== "0@c.us" && (item.type === "user" || item.type === "group")
                    })
                    .map((item): Chat => {
                        const rawId = String(item.id)
                        const isGroup = rawId.endsWith("@g.us")
                        const id = rawId.replace("@c.us", "").replace("@g.us", "")
                        return {
                            id,
                            name: item.name?.trim() || id,
                            avatarUrl: null,
                            lastMessage: "",
                            lastMessageAt: 0,
                            unreadCount: item.unreadCount ?? 0,
                            isGroup,
                            messages: [],
                        }
                    })

                setChats((prev) => mergeChats(prev, remote))
            } catch (e) {
                console.error("[getChats]", e)
            } finally {
                if (!cancelled) setIsHydrating(false)
            }
        }

        hydrate()
        return () => {
            cancelled = true
        }
    }, [credentials?.idInstance, credentials?.apiTokenInstance])

    const startChat = useCallback((phone: string) => {
        const id = phone.replace(/\D/g, "")
        if (!id) return
        setChats((prev) => prev.some((c) => c.id === id) ? prev : [{
            id,
            name: id,
            avatarUrl: null,
            lastMessage: "",
            lastMessageAt: Date.now(),
            unreadCount: 0,
            messages: []
        }, ...prev])
        setSelectedChatIdState(id)
    }, [])

    const sendMessage = useCallback(async (chatId: string, text: string) => {
        const trimmed = text.trim()
        if (!trimmed || !credentials?.idInstance || !credentials?.apiTokenInstance) return
        const message: ChatMessage = {id: crypto.randomUUID(), text: trimmed, direction: "out", timestamp: Date.now()}
        setChats((prev) => prev.map((c) => c.id === chatId ? {
            ...c,
            messages: [...c.messages, message],
            lastMessage: trimmed,
            lastMessageAt: message.timestamp,
            unreadCount: 0
        } : c))
        try {
            await fetch(`https://api.green-api.com/waInstance${credentials.idInstance}/sendMessage/${credentials.apiTokenInstance}`, {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({chatId: `${chatId}@c.us`, message: trimmed}),
            })
        } catch (e) {
            console.error("[sendMessage]", e)
        }
    }, [credentials?.idInstance, credentials?.apiTokenInstance])

    const sendMedia = useCallback(async (chatId: string, file: File, caption = "") => {
        if (!credentials?.idInstance || !credentials?.apiTokenInstance) return
        const mediaHost = credentials.mediaUrl || "https://media.green-api.com"
        const localUrl = URL.createObjectURL(file)
        const message: ChatMessage = {
            id: crypto.randomUUID(), text: caption, direction: "out", timestamp: Date.now(),
            mediaUrl: localUrl, mediaType: resolveMediaType(file.type), fileName: file.name,
        }
        setChats((prev) => prev.map((c) => c.id === chatId ? {
            ...c,
            messages: [...c.messages, message],
            lastMessage: caption || `📎 ${file.name}`,
            lastMessageAt: message.timestamp
        } : c))
        try {
            const formData = new FormData()
            formData.append("chatId", `${chatId}@c.us`)
            formData.append("file", file, file.name)
            if (caption) formData.append("caption", caption)
            const res = await fetch(`${mediaHost}/waInstance${credentials.idInstance}/sendFileByUpload/${credentials.apiTokenInstance}`, {
                method: "POST",
                body: formData
            })
            if (!res.ok) throw new Error(await res.text())
            const data = await res.json()
            if (data?.urlFile) {
                setChats((prev) => prev.map((c) => c.id === chatId ? {
                    ...c,
                    messages: c.messages.map((m) => m.id === message.id ? {...m, mediaUrl: data.urlFile} : m)
                } : c))
            }
        } catch (e) {
            console.error("[sendMedia]", e)
        } finally {
            setTimeout(() => URL.revokeObjectURL(localUrl), 30000)
        }
    }, [credentials?.idInstance, credentials?.apiTokenInstance, credentials?.mediaUrl])

    const receiveMessage = useCallback((chatId: string, text: string, timestamp = Date.now(), media?: {
        url: string;
        type: ChatMessage["mediaType"];
        fileName?: string
    }) => {
        const message: ChatMessage = {
            id: crypto.randomUUID(), text, direction: "in", timestamp,
            mediaUrl: media?.url ?? null, mediaType: media?.type ?? null, fileName: media?.fileName ?? null,
        }
        setChats((prev) => {
            const exists = prev.some((c) => c.id === chatId)
            if (!exists) {
                return [{
                    id: chatId,
                    name: chatId,
                    avatarUrl: null,
                    lastMessage: text || (media ? `📎 ${media.fileName ?? "файл"}` : ""),
                    lastMessageAt: timestamp,
                    unreadCount: 1,
                    messages: [message]
                }, ...prev]
            }
            return prev.map((c) => c.id === chatId ? {
                ...c,
                messages: [...c.messages, message],
                lastMessage: text || (media ? `📎 ${media.fileName ?? "фото"}` : ""),
                lastMessageAt: timestamp,
                unreadCount: selectedChatId === chatId ? 0 : c.unreadCount + 1
            } : c)
        })
    }, [selectedChatId])

    const deleteChat = useCallback((chatId: string) => {
        setChats((prev) => prev.filter((c) => c.id !== chatId))
        setSelectedChatIdState((prev) => (prev === chatId ? null : prev))
    }, [])

    const loadChatHistory = useCallback(async (chatId: string) => {
        if (!credentials?.idInstance || !credentials?.apiTokenInstance) return
        let shouldSkip = false
        setChats((prev) => {
            const ex = prev.find((c) => c.id === chatId)
            if (ex && ex.messages.length > 0) shouldSkip = true
            return prev
        })
        if (shouldSkip) return
        try {
            const res = await fetch(`https://api.green-api.com/waInstance${credentials.idInstance}/getChatHistory/${credentials.apiTokenInstance}`, {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({chatId: `${chatId}@c.us`, count: 50}),
            })
            if (!res.ok) return
            const data = await res.json()
            if (!Array.isArray(data)) return

            const messages: ChatMessage[] = (data as GreenHistoryItem[])
                .slice()
                .reverse()
                .map((item): ChatMessage => {
                    const direction: ChatMessage["direction"] = item.type === "outgoing" ? "out" : "in"

                    const text = item.textMessage ?? item.extendedTextMessage?.text ?? item.caption ?? ""

                    const url = item.downloadUrl ?? item.urlFile ?? item.fileMessageData?.downloadUrl ?? null

                    let mediaType: ChatMessage["mediaType"] = null
                    if (item.typeMessage) {
                        mediaType = resolveMediaType(item.typeMessage)
                    } else if (url) {
                        mediaType = resolveMediaType(item.mimeType ?? "")
                    }

                    return {
                        id: String(item.idMessage ?? crypto.randomUUID()),
                        text: String(text),
                        direction,
                        timestamp: (item.timestamp ?? 0) * 1000,
                        mediaUrl: url,
                        mediaType,
                        fileName: item.fileName ?? null,
                    }
                })
                .filter((m): m is ChatMessage => Boolean(m.text || m.mediaUrl))

            if (!messages.length) return
            const last = messages[messages.length - 1]
            setChats((prev) => prev.map((c) => c.id === chatId ? {
                ...c,
                messages,
                lastMessage: last.text || (last.mediaUrl ? `📎 ${last.fileName || "фото"}` : ""),
                lastMessageAt: last.timestamp || c.lastMessageAt
            } : c))
        } catch (e) {
            console.error("[loadChatHistory]", e)
        }
    }, [credentials?.idInstance, credentials?.apiTokenInstance])

    // Polling - SENIOR FIX: без continue/break
    const receiveMessageRef = useRef(receiveMessage)
    useEffect(() => {
        receiveMessageRef.current = receiveMessage
    }, [receiveMessage])

    useEffect(() => {
        if (!credentials?.idInstance || !credentials?.apiTokenInstance) return
        let cancelled = false
        let timeoutId: ReturnType<typeof setTimeout>

        async function poll() {
            try {
                const res = await fetch(`https://api.green-api.com/waInstance${credentials!.idInstance}/receiveNotification/${credentials!.apiTokenInstance}`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const raw = await res.text()
                if (!raw) {
                    if (!cancelled) timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
                    return
                }
                const data = JSON.parse(raw)
                if (data?.body) {
                    const {receiptId, body} = data
                    if (body.typeWebhook === "incomingMessageReceived") {
                        const senderId = String(body.senderData?.chatId ?? "").replace("@c.us", "").replace("@g.us", "")
                        const md = body.messageData
                        const ts = (body.timestamp ?? Date.now() / 1000) * 1000
                        if (senderId && md) {
                            const txt = md.textMessageData?.textMessage || md.extendedTextMessageData?.text || md.fileMessageData?.caption || ""
                            if (md.typeMessage === "textMessage" || md.typeMessage === "extendedTextMessage") {
                                receiveMessageRef.current(senderId, txt, ts)
                            } else if (md.fileMessageData?.downloadUrl) {
                                const f = md.fileMessageData
                                receiveMessageRef.current(senderId, f.caption || "", ts, {
                                    url: f.downloadUrl,
                                    type: resolveMediaType(f.mimeType || md.typeMessage),
                                    fileName: f.fileName,
                                })
                            }
                        }
                    }
                    await fetch(`https://api.green-api.com/waInstance${credentials!.idInstance}/deleteNotification/${credentials!.apiTokenInstance}/${receiptId}`, {method: "DELETE"})
                }
            } catch (e) {
                console.error("[poll]", e)
            } finally {
                if (!cancelled) timeoutId = setTimeout(poll, POLL_INTERVAL_MS)
            }
        }

        poll()
        return () => {
            cancelled = true;
            clearTimeout(timeoutId)
        }
    }, [credentials?.idInstance, credentials?.apiTokenInstance])
    const deleteMessage = useCallback(async (chatId: string, messageId: string) => {
        // сначала убираем локально — мгновенный отклик в UI
        setChats((prev) => prev.map((c) => c.id === chatId ? {
            ...c,
            messages: c.messages.filter((m) => m.id !== messageId),
        } : c))

        if (!credentials?.idInstance || !credentials?.apiTokenInstance) return
        try {
            await fetch(`https://api.green-api.com/waInstance${credentials.idInstance}/deleteMessage/${credentials.apiTokenInstance}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId: `${chatId}@c.us`, idMessage: messageId }),
            })
        } catch (e) {
            console.error("[deleteMessage]", e)
        }
    }, [credentials?.idInstance, credentials?.apiTokenInstance])

    const markChatAsRead = useCallback(async (chatId: string) => {
        // локально — сразу
        setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, unreadCount: 0 } : c))

        if (!credentials?.idInstance || !credentials?.apiTokenInstance) return
        try {
            await fetch(`https://api.green-api.com/waInstance${credentials.idInstance}/readChat/${credentials.apiTokenInstance}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId: `${chatId}@c.us` }),
            })
        } catch (e) {
            console.error("[readChat]", e)
        }
    }, [credentials?.idInstance, credentials?.apiTokenInstance])
    return {
        chats,
        selectedChatId,
        isHydrating,
        setSelectedChatId,
        startChat,
        sendMessage,
        sendMedia,
        receiveMessage,
        deleteChat,
        loadChatHistory,
        markChatAsRead,
        deleteMessage
    }
}