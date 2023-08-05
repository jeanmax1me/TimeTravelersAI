import dotenv from "dotenv";
import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { Replicate } from "langchain/llms/replicate";
import { CallbackManager } from "langchain/callbacks";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

dotenv.config({ path: `.env` });

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const traveler = await prismadb.traveler.update({
      where: {
        id: params.chatId
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      }
    });

    if (!traveler) {
      return new NextResponse("Traveler not found", { status: 404 });
    }

    const name = traveler.id;
    const traveler_file_name = name + ".txt";

    const travelerKey = {
      travelerName: name!,
      userId: user.id,
      modelName: "llama2-13b",
    };
    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(travelerKey);
    if (records.length === 0) {
      await memoryManager.seedChatHistory(traveler.seed, "\n\n", travelerKey);
    }
    await memoryManager.writeToHistory("User: " + prompt + "\n", travelerKey);

    // Query Pinecone

    const recentChatHistory = await memoryManager.readLatestHistory(travelerKey);

    // Right now the preamble is included in the similarity search, but that
    // shouldn't be an issue

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      traveler_file_name
    );

    let relevantHistory = "";
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }
    const { handlers } = LangChainStream();
    // Call Replicate for inference
    const model = new Replicate({
      model:
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    // Turn verbose on for debugging
    model.verbose = true;

    const resp = String(
      await model
        .call(
          `
        ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${traveler.name}: prefix. 

        ${traveler.instructions}

        Below are relevant details about ${traveler.name}'s past and the conversation you are in.
        ${relevantHistory}


        ${recentChatHistory}\n${traveler.name}:`
        )
        .catch(console.error)
    );

    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0];

    await memoryManager.writeToHistory("" + response.trim(), travelerKey);
    var Readable = require("stream").Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);
    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory("" + response.trim(), travelerKey);

      await prismadb.traveler.update({
        where: {
          id: params.chatId
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        }
      });
    }
    return new StreamingTextResponse(s);

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error processing request:", error);
      return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    } else {
      console.error("Error processing request:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
};