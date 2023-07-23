/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = (await request.json()) as { email: string; name: string; password: string };
		const { email, name, password } = body;
		const hashedPassword = await bcrypt.hash(password, 12);
		const existingUser = await prisma.user.findUnique({
			where: {
				email,
			},
		});
		if (existingUser) {
			return NextResponse.json({ error: "User already exists" }, { status: 400 });
		}
		const emailVerificationToken = jwt.sign({ email }, String(process.env.NEXTAUTH_SECRET) + email, {
			expiresIn: "1d",
		});
		// const decoded = jwt.verify(emailVerificationToken, String(process.env.NEXTAUTH_SECRET) + email);
		const user = await prisma.user.create({
			data: {
				email,
				name,
				hashedPassword,
				emailVerified: false,
				verificationCode: emailVerificationToken,
			},
		});
		return NextResponse.json(user);
	} catch (error) {
		return NextResponse.json({ error: (error as Error).message }, { status: 500 });
	}
}
