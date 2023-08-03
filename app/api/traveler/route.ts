import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
const body = await req.json();
const user = await currentUser();
const { src, name, description, instructions, seed, categoryId } = body;

if (!user || !user.id || !user.firstName) {
    return new NextResponse("Unauthorized", { status: 401 });
}

if (!src || !name || !description || !instructions || !seed || !categoryId) {
    return new NextResponse("Missing required fields", { status: 400})
}

//todo check for premium acc

const traveler = await prismadb.traveler.create({
    data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed
    }
});

return NextResponse.json(traveler);

    } catch (error) {
        console.log("[TRAVELER_POST]", error);
        return new NextResponse("Internal Error", { status: 500})
    }

  
}