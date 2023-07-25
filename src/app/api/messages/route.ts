import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const currentUser = await getCurrentUser();
		const body = (await request.json()) as { message: string; image: string; conversationId: string };
		const { message, image, conversationId } = body;
		if (!currentUser?.id || !currentUser.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}
		const newMessage = await prisma.message.create({
			include: {
				seen: true,
				sender: true,
			},
			data: {
				body: message,
				image: image,
				conversation: {
					connect: { id: conversationId },
				},
				sender: {
					connect: { id: currentUser.id },
				},
				seen: {
					connect: {
						id: currentUser.id,
					},
				},
			},
		});
		await prisma.conversation.update({
			where: {
				id: conversationId,
			},
			data: {
				lastMessageAt: new Date(),
				messages: {
					connect: {
						id: newMessage.id,
					},
				},
			},
			include: {
				users: true,
				messages: {
					include: {
						seen: true,
					},
				},
			},
		});
		return NextResponse.json(newMessage);
	} catch (error) {
		console.log(error, "ERROR_MESSAGES");
		return new NextResponse("Error", { status: 500 });
	}
}
