import nodemailer from "nodemailer";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
export const transporter = nodemailer.createTransport({
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD,
		clientId: process.env.OAUTH_CLIENT_ID,
		clientSecret: process.env.OAUTH_CLIENT_SECRET,
		refreshToken: process.env.OAUTH_REFRESH_TOKEN,
	},
});
