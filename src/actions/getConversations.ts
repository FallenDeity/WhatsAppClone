"use server";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { prisma } from "@/lib/prisma";
import { FullConversationType } from "@/lib/types";

import getCurrentUser from "./getCurrentUser";

const getConversations = async (): Promise<FullConversationType[]> => {
	const currentUser = await getCurrentUser();

	if (!currentUser?.id) {
		return [];
	}

	try {
		const conversations = await prisma.conversation.findMany({
			orderBy: {
				lastMessageAt: "desc",
			},
			where: {
				userIds: {
					has: currentUser.id,
				},
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
				messages: {
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
				},
			},
		});
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return conversations;
	} catch (error) {
		console.log(error, "CONVERSATIONS_FETCH_ERROR");
		return [];
	}
};

export default getConversations;
