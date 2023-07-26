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
		const body = (await request.json()) as {
			name: string;
			image: string;
			about: string;
		};
		if (!currentUser?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}
		const updatedUser = await prisma.user.update({
			where: {
				id: currentUser.id,
			},
			data: body,
		});
		await pusherServer.trigger(String(updatedUser.email), "user:update", updatedUser);
		return NextResponse.json(updatedUser);
	} catch (error) {
		console.log(error, "ERROR_MESSAGES");
		return new NextResponse("Error", { status: 500 });
	}
}
