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

export async function DELETE(_: Request, { params }: { params: IParams }): Promise<NextResponse> {
	try {
		const { conversationId } = params;
		const currentUser = await getCurrentUser();

		if (!currentUser?.id) {
			return NextResponse.json(null);
		}

		const existingConversation = await prisma.conversation.findUnique({
			where: {
				id: conversationId,
			},
			include: {
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

		if (!existingConversation) {
			return new NextResponse("Invalid ID", { status: 400 });
		}

		const deletedConversation = await prisma.conversation.deleteMany({
			where: {
				id: conversationId,
				userIds: {
					hasSome: [currentUser.id],
				},
			},
		});
		existingConversation.users.map(async (user) => {
			if (user.email) {
				await pusherServer.trigger(user.email, "conversation:remove", existingConversation);
			}
		});
		return NextResponse.json(deletedConversation);
	} catch (error) {
		return NextResponse.json(null);
	}
}
