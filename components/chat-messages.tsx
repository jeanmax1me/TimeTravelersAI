"use client";

import { Traveler } from "@prisma/client";
import { ChatMessage, ChatMessageProps } from "./chat-message";

interface ChatMessagesProps {
    messages: ChatMessageProps[];
    isLoading: boolean;
    traveler: Traveler;
};

export const ChatMessages = ({
    messages: [],
    isLoading,
    traveler
}: ChatMessagesProps) => {
    return (
        <div className="flex-1 overflow-y-auto pr-4">
        <ChatMessage
        src={traveler.src} 
        role="system"
        content={`Hello, I am ${traveler.name}, ${traveler.description}`}
        />
         <ChatMessage
        role="user"
        content={`yooo julius`}
        />
        </div>
        )
}