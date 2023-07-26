import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

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
		const updateConversation = await prisma.conversation.update({
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
		await pusherServer.trigger(conversationId, "messages:new", newMessage);
		const lastMessage = updateConversation.messages[updateConversation.messages.length - 1];
		updateConversation.users.map(async (user): Promise<void> => {
			await pusherServer.trigger(String(user.email), "conversation:update", {
				id: conversationId,
				messages: [lastMessage],
			});
		});
		return NextResponse.json(newMessage);
	} catch (error) {
		console.log(error, "ERROR_MESSAGES");
		return new NextResponse("Error", { status: 500 });
	}
}
