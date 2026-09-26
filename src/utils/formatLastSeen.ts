export function formatLastSeen(timestamp: number): string {
    if (!timestamp || timestamp <= 0) {
        return "click here for contact info" // или просто пусто / номер
    }

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60_000)

    // «только что» — не online, а last seen recently
    if (diffMin < 1) return "last seen just now"
    if (diffMin < 60) return `last seen ${diffMin} min ago`

    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })

    const isToday = date.toDateString() === now.toDateString()
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