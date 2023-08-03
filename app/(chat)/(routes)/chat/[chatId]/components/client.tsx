"use client";

import ChatHeader from "@/components/chat-header";
import { Message, Traveler } from "@prisma/client";

interface ChatClientProps {
    traveler: Traveler & {
        messages: Message[];
        _count: {
            messages: number;
        }
    }
}

export const ChatClient = ({traveler}: ChatClientProps) => {
return (
  <div className="flex flex-col h-full p-4 space-y-2">
    <ChatHeader traveler={traveler} />
    </div>
    )
}