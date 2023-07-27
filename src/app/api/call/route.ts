/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { User } from "@prisma/client";
import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { pusherServer } from "@/lib/pusher";

interface IParams {
	id: number;
	sender: User;
	type: "voice" | "video";
	receiver: User;
	ended: boolean;
}

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = await request.json();
		const { id, sender, type, receiver, ended } = body as IParams;
		const currentUser = await getCurrentUser();
		if (!currentUser?.id) {
			return NextResponse.json(null);
		}
		if (ended) {
			await pusherServer.trigger(receiver.email ?? "", "call:cancelled", {
				roomID: id,
				user: sender,
				type,
				outgoing: false,
			});
			return NextResponse.json("Success");
		}
		await pusherServer.trigger(receiver.email ?? "", "call:incoming", {
			roomID: id,
			user: sender,
			type,
			outgoing: false,
			incoming: true,
		});
		return NextResponse.json("Success");
	} catch (error) {
		console.log(error, "Call route");
		return NextResponse.json(null);
	}
}
