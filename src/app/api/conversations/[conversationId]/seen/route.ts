/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

interface IParams {
	conversationId?: string;
}

export async function POST(_: Request, { params }: { params: IParams }): Promise<NextResponse> {
	try {
		const currentUser = await getCurrentUser();
		const { conversationId } = params;

		if (!currentUser?.id || !currentUser.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}
		const conversation = await prisma.conversation.findUnique({
			where: {
				id: conversationId,
			},
			include: {
				messages: {
					include: {
						seen: {
							select: {
								id: true,
								email: true,
								image: true,
								name: true,
								createdAt: true,
								updatedAt: true,
								lastSeen: true,
								conversationIds: false,
								seenMessageIds: false,
							},
						},
					},
				},
				users: {
					select: {
						id: true,
						email: true,
						image: true,
						name: true,
						createdAt: true,
						updatedAt: true,
						lastSeen: true,
						conversationIds: false,
						seenMessageIds: false,
					},
				},
			},
		});
		if (!conversation) {
			return new NextResponse("Invalid ID", { status: 400 });
		}
		const lastMessage = conversation.messages[conversation.messages.length - 1];
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!lastMessage) {
			return NextResponse.json(conversation);
		}
		const messagesToUpdate = conversation.messages.filter((message) => !message.seenIds.includes(currentUser.id));
		const messageIdsToUpdate = messagesToUpdate.map((message) => message.id);
		await prisma.conversation.update({
			where: {
				id: conversationId,
			},
			data: {
				messages: {
					updateMany: {
						where: {
							id: {
								in: messageIdsToUpdate,
							},
						},
						data: {
							seenIds: {
								set: Array.from(new Set([...lastMessage.seenIds, currentUser.id])),
							},
						},
					},
				},
			},
		});
		const updatedMessages = await prisma.message.findMany({
			where: {
				id: {
					in: messageIdsToUpdate,
				},
			},
			include: {
				sender: {
					select: {
						id: true,
						email: true,
						image: true,
						name: true,
						createdAt: true,
						updatedAt: true,
						lastSeen: true,
						conversationIds: false,
						seenMessageIds: false,
					},
				},
				seen: {
					select: {
						id: true,
						email: true,
						image: true,
						name: true,
						createdAt: true,
						updatedAt: true,
						lastSeen: true,
						conversationIds: false,
						seenMessageIds: false,
					},
				},
			},
		});
		for (const message of updatedMessages) {
			await pusherServer.trigger(String(currentUser.email), "conversation:update", {
				id: conversationId,
				messages: [message],
			});
		}
		if (lastMessage.seenIds.includes(currentUser.id)) {
			return NextResponse.json(conversation);
		}
		for (const message of updatedMessages) {
			await pusherServer.trigger(String(conversationId), "message:update", [message]);
		}
		return new NextResponse("Success");
	} catch (error) {
		console.log(error, "ERROR_MESSAGES_SEEN");
		return new NextResponse("Error", { status: 500 });
	}
}
