"use server";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { prisma } from "@/lib/prisma";
import { FullConversationType } from "@/lib/types";

import getCurrentUser from "./getCurrentUser";

const getConversationById = async (conversationId: string): Promise<FullConversationType | null> => {
	try {
		const currentUser = await getCurrentUser();

		if (!currentUser?.email) {
			return null;
		}

		const conversation = await prisma.conversation.findUnique({
			where: {
				id: conversationId,
			},
			include: {
				users: true,
				messages: {
					include: {
						sender: true,
						seen: true,
					},
				},
			},
		});
		conversation?.messages.sort((a, b) => {
			if (a.createdAt && b.createdAt) {
				return a.createdAt.getTime() - b.createdAt.getTime();
			}
			return 0;
		});
		return conversation;
	} catch (error) {
		console.log(error, "CONVERSATION_FETCH_ERROR");
		return null;
	}
};

export default getConversationById;
