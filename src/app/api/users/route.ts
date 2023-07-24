/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");
		if (!email) {
			return NextResponse.json({ error: "Email not provided" }, { status: 400 });
		}
		const existingUser = await prisma.user.findUnique({
			where: {
				email,
			},
		});
		if (!existingUser) {
			return NextResponse.json({ error: "User does not exist" }, { status: 400 });
		}
		if (existingUser.verificationCode === "" && !existingUser.emailVerified) {
			await prisma.user.update({
				where: {
					email,
				},
				data: {
					emailVerified: true,
				},
			});
			existingUser.emailVerified = true;
		}
		return NextResponse.json(existingUser);
	} catch (error) {
		return NextResponse.json({ error: (error as Error).message }, { status: 500 });
	}
}
