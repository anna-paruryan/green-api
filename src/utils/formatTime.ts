 export function formatListTime(timestamp: number) {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

    return date.toLocaleDateString([], { day: "numeric", month: "numeric", year: "2-digit" })
}
export function formatLastSeen(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60_000)

    if (diffMin < 1) return "online"
    if (diffMin < 60) return `last seen ${diffMin} min ago`

    const isToday = date.toDateString() === now.toDateString()
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    if (isToday) return `last seen today at ${time}`

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
        return `last seen yesterday at ${time}`
    }

    return `last seen ${date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
    })} at ${time}`
}

export function formatMessageTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })
}