/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export default async function handler(
	request: NextApiRequest,
	response: NextApiResponse
): Promise<NextApiResponse<void>> {
	const session = await getServerSession(request, response, authOptions);

	if (!session?.user?.email) {
		return response.status(401);
	}

	const socketId = request.body.socket_id as string;
	const channel = request.body.channel_name as string;
	const data = {
		user_id: session.user.email,
	};
	await prisma.user.update({
		where: {
			email: session.user.email,
		},
		data: {
			lastSeen: new Date(),
		},
	});
	const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	return response.send(authResponse);
}
