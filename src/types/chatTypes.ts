//src/types/chatTypes.ts
export interface ChatMessage {
    id: string
    text: string
    direction: "in" | "out"
    timestamp: number
    mediaUrl?: string | null
    mediaType?: "image" | "video" | "audio" | "document" | null
    fileName?: string | null
}

export interface Chat {
    id: string
    name: string
    lastMessage: string
    lastMessageAt: number
    unreadCount: number
    avatarUrl?: string | null
    mediaUrl?: string
    isFavorite?: boolean
    isGroup?: boolean
    messages: ChatMessage[]
}

export interface GreenApiCredentials {
    idInstance: string
    apiTokenInstance: string
    apiUrl?: string
    mediaUrl?: string
}