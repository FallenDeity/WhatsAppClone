/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { User } from "@prisma/client";
import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { pusherServer } from "@/lib/pusher";

interface IParams {
	id: number;
	receiver: User;
	accepted: boolean;
}

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = await request.json();
		const { id, receiver, accepted } = body as IParams;
		const currentUser = await getCurrentUser();
		if (!currentUser?.id) {
			return NextResponse.json(null);
		}
		await pusherServer.trigger(String(id), "call:accepted", {
			id,
			accepted,
			receiver,
		});
		return NextResponse.json("Success");
	} catch (error) {
		console.log(error, "Call Accept route");
		return NextResponse.json(null);
	}
}
