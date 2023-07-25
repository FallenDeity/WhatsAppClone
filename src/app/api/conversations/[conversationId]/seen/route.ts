/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";

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
						seen: true,
					},
				},
				users: true,
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
								push: currentUser.id,
							},
						},
					},
				},
			},
		});
		/*
		await prisma.message.update({
			where: {
				id: lastMessage.id,
			},
			include: {
				sender: true,
				seen: true,
			},
			data: {
				seen: {
					connect: {
						id: currentUser.id,
					},
				},
			},
		});
		*/
		return new NextResponse("Success");
	} catch (error) {
		console.log(error, "ERROR_MESSAGES_SEEN");
		return new NextResponse("Error", { status: 500 });
	}
}
