/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const currentUser = await getCurrentUser();
		const body = await request.json();
		const { userId, isGroup, members, name, logo } = body;
		if (!currentUser?.id || !currentUser.email) {
			return new NextResponse("Unauthorized", { status: 400 });
		}
		if (isGroup && (!members || members.length < 2 || !name)) {
			return new NextResponse("Invalid data", { status: 400 });
		}
		if (isGroup) {
			const newConversation = await prisma.conversation.create({
				data: {
					name,
					isGroup,
					users: {
						connect: [
							...members.map((member: { value: string }) => ({
								id: member.value,
							})),
							{
								id: currentUser.id,
							},
						],
					},
					logo,
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
			newConversation.users.map(async (user): Promise<void> => {
				if (user.email) {
					await pusherServer.trigger(user.email, "conversation:new", newConversation);
				}
			});
			return NextResponse.json(newConversation);
		}
		const existingConversations = await prisma.conversation.findMany({
			where: {
				OR: [
					{
						userIds: {
							equals: [currentUser.id, userId],
						},
					},
					{
						userIds: {
							equals: [userId, currentUser.id],
						},
					},
				],
			},
		});
		if (existingConversations.length > 0) {
			return NextResponse.json(existingConversations[0]);
		}
		const newConversation = await prisma.conversation.create({
			data: {
				users: {
					connect: [
						{
							id: currentUser.id,
						},
						{
							id: userId,
						},
					],
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
			},
		});
		newConversation.users.map(async (user): Promise<void> => {
			if (user.email) {
				await pusherServer.trigger(user.email, "conversation:new", newConversation);
			}
		});
		return NextResponse.json(newConversation);
	} catch (error) {
		return new NextResponse("Internal Error", { status: 500 });
	}
}
