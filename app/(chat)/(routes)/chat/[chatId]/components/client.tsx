"use client";

import ChatHeader from "@/components/chat-header";
import { Message, Traveler } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useCompletion } from "ai/react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";
import { ChatForm } from "@/components/chat-form";

interface ChatClientProps {
  traveler: Traveler & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

export const ChatClient = ({ traveler }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>(traveler.messages);
  const { user } = useUser();
  const { toast } = useToast();

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${traveler.id}`,
      onFinish(prompt, completion) {
        const systemMessage = {
          role: "system",
          content: completion,
        };

        setMessages((current) => [...current, systemMessage]);
        setInput("");

        router.refresh();
      },
      onError(error) {
        toast({
          description: "An error occurred while fetching data.",
          variant: "destructive",
        });
      },
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const userMessage = {
        role: "user",
        content: input,
      };

      setMessages((current) => [...current, userMessage]);

      handleSubmit(e);
    } catch (error) {
      toast({
        description: "An error occurred while submitting the message.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader traveler={traveler} />
      <div>Messages To Do</div>
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
