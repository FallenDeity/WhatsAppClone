/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import { transporter } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

const HTML_TEMPLATE = (text: string): string => {
	return `
	  <!DOCTYPE html>
	  <html>
		<head>
		  <meta charset="utf-8">
		  <title>NodeMailer Email Template</title>
		  <style>
			.container {
			  width: 100%;
			  height: 100%;
			  padding: 20px;
			  background-color: #f4f4f4;
			}
			.email {
			  width: 80%;
			  margin: 0 auto;
			  background-color: #fff;
			  padding: 20px;
			}
			.email-header {
			  background-color: #0b9e10;
			  color: #fff;
			  padding: 20px;
			  text-align: center;
			}
			.email-body {
			  padding: 20px;
			}
			.email-footer {
			  background-color: #0b9e10;
			  color: #fff;
			  padding: 20px;
			  text-align: center;
			}
		  </style>
		</head>
		<body>
		  <div class="container">
			<div class="email">
			  <div class="email-header">
				<h1>WhatsApp Clone</h1>
			  </div>
			  <div class="email-body">
				<p>${text}</p>
			  </div>
			  <div class="email-footer">
				<p>You can safely ignore this email if it wasn't you.</p>
			  </div>
			</div>
		  </div>
		</body>
	  </html>
	`;
};

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
		if (existingUser && existingUser.verificationCode === "") {
			return NextResponse.json({ error: "User already exists" }, { status: 400 });
		} else if (existingUser && existingUser.verificationCode !== "") {
			const decoded = jwt.verify(
				String(existingUser.verificationCode),
				String(process.env.NEXTAUTH_SECRET) + email
			);
			if (decoded) {
				return NextResponse.json({ error: "User already exists" }, { status: 400 });
			} else {
				await prisma.user.delete({
					where: {
						email,
					},
				});
			}
		}
		const emailVerificationToken = jwt.sign({ email }, String(process.env.NEXTAUTH_SECRET) + email, {
			expiresIn: "1d",
		});
		const url = `${String(process.env.NEXTAUTH_URL)}/verify?token=${emailVerificationToken}`;
		const mailOptions = {
			from: process.env.MAIL_USERNAME,
			to: email,
			subject: "Email Verification",
			html: HTML_TEMPLATE(
				`Your verification link is: <a href="${url}">${url}</a>. This link will expire in 24 hours.`
			),
		};
		await transporter.sendMail(mailOptions);
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
