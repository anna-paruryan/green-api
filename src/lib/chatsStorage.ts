import type { Chat } from "../types/chatTypes.ts"

const STORAGE_KEY = "wa:chats:v1"
const SELECTED_KEY = "wa:selectedChatId:v1"

export function loadChats(): Chat[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed as Chat[]
    } catch {
        // битые данные — не роняем приложение
        localStorage.removeItem(STORAGE_KEY)
        return []
    }
}

export function saveChats(chats: Chat[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    } catch (e) {
        // quota exceeded и т.п.
        console.warn("[chatsStorage] save failed", e)
    }
}

export function loadSelectedChatId(): string | null {
    return localStorage.getItem(SELECTED_KEY)
}

export function saveSelectedChatId(id: string | null) {
    if (id) localStorage.setItem(SELECTED_KEY, id)
    else localStorage.removeItem(SELECTED_KEY)
}

/** Merge: remote не затирает локальные messages */
export function mergeChats(local: Chat[], remote: Chat[]): Chat[] {
    const map = new Map<string, Chat>()

    for (const chat of local) {
        map.set(chat.id, chat)
    }

    for (const r of remote) {
        const existing = map.get(r.id)
        if (!existing) {
            map.set(r.id, r)
            continue
        }

        map.set(r.id, {
            ...existing,
            name: r.name || existing.name,
            avatarUrl: r.avatarUrl ?? existing.avatarUrl,
            lastMessageAt: Math.max(existing.lastMessageAt, r.lastMessageAt),
            lastMessage: existing.lastMessage || r.lastMessage,
        })
    }

    return Array.from(map.values()).sort(
        (a, b) => b.lastMessageAt - a.lastMessageAt,
    )
}