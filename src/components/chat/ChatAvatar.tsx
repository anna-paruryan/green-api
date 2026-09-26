// components/chat/ChatAvatar.tsx
import { User } from "lucide-react"

interface ChatAvatarProps {
    name: string
    avatarUrl?: string | null
    size?: number
}

export default function ChatAvatar({ name, avatarUrl, size = 48 }: ChatAvatarProps) {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className="shrink-0 rounded-full object-cover"
                style={{ width: size, height: size }}
            />
        )
    }
    
    return (
        <div
            className="flex shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-[#54656f]"
            style={{ width: size, height: size }}
        >
            <User style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.75} />
        </div>
    )
}