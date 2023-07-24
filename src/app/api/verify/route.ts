/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = (await request.json()) as { email?: string; token?: string };
		if (!body.email || !body.token) {
			return NextResponse.json({ error: "Email or token not provided" }, { status: 400 });
		}
		const existingUser = await prisma.user.findUnique({
			where: {
				email: body.email,
			},
		});
		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
		try {
			const decoded = jwt.verify(body.token, String(process.env.NEXTAUTH_SECRET) + body.email);
			if (!decoded) {
				const now = new Date();
				const diff = now.getTime() - existingUser.createdAt.getTime();
				const diffInDays = diff / (1000 * 3600 * 24);
				if (diffInDays > 1) {
					await prisma.user.delete({
						where: {
							email: body.email,
						},
					});
					return NextResponse.json({ error: "User not found" }, { status: 404 });
				}
				return NextResponse.json({ error: "Invalid token or expired token." }, { status: 400 });
			}
		} catch (error) {
			return NextResponse.json({ error: "Invalid token or expired token." }, { status: 400 });
		}
		const user = await prisma.user.update({
			where: {
				email: body.email,
			},
			data: {
				emailVerified: true,
				verificationCode: "",
			},
		});
		return NextResponse.json(user);
	} catch (error) {
		return NextResponse.json({ error: (error as Error).message }, { status: 500 });
	}
}
