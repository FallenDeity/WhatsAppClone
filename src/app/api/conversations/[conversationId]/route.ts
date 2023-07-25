/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";

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
				users: true,
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
		return NextResponse.json(deletedConversation);
	} catch (error) {
		return NextResponse.json(null);
	}
}
