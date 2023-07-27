"use client";

/* eslint-disable @typescript-eslint/ban-ts-comment */

import crypto_1 from "crypto";

let ErrorCode = {};

(function (ErrorCode): void {
	// @ts-expect-error
	ErrorCode[(ErrorCode.success = 0)] = "success";
	// @ts-expect-error
	ErrorCode[(ErrorCode.appIDInvalid = 1)] = "appIDInvalid";
	// @ts-expect-error
	ErrorCode[(ErrorCode.userIDInvalid = 3)] = "userIDInvalid";
	// @ts-expect-error
	ErrorCode[(ErrorCode.secretInvalid = 5)] = "secretInvalid";
	// @ts-expect-error
	ErrorCode[(ErrorCode.effectiveTimeInSecondsInvalid = 6)] = "effectiveTimeInSecondsInvalid";
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
})(ErrorCode || (ErrorCode = {}));

function RndNum(a: number, b: number): number {
	// Function to return random number within given range
	return Math.ceil((a + (b - a)) * Math.random());
}

function makeRandomIv(): string {
	const str = "0123456789abcdefghijklmnopqrstuvwxyz";
	const result = [];
	for (let i = 0; i < 16; i++) {
		const r = Math.floor(Math.random() * str.length);
		result.push(str.charAt(r));
	}
	return result.join("");
}

function getAlgorithm(keyBase64: string): string {
	const key = Buffer.from(keyBase64);
	switch (key.length) {
		case 16:
			return "aes-128-cbc";
		case 24:
			return "aes-192-cbc";
		case 32:
			return "aes-256-cbc";
	}
	throw new Error(`invalid key length: ${key.length}`);
}

function aesEncrypt(plainText: string, key: string, iv: string): ArrayBuffer {
	const cipher = crypto_1.createCipheriv(getAlgorithm(key), key, iv);
	cipher.setAutoPadding(true);
	const encrypted = cipher.update(plainText);
	const final = cipher.final();
	const out = Buffer.concat([encrypted, final]);
	return Uint8Array.from(out).buffer;
}

export function generateToken04(
	appId: number,
	userId: string,
	secret: string,
	effectiveTimeInSeconds: number,
	payload?: string
): string {
	if (!appId || typeof appId !== "number") {
		// Check if appID is valid
		throw new Error("appID invalid");
	}
	if (!userId || typeof userId !== "string") {
		// Check if userId is valid
		throw new Error("userID invalid");
	}
	if (!secret || typeof secret !== "string" || secret.length !== 32) {
		// Check if secret is valid
		throw new Error("secret invalid");
	}
	if (!effectiveTimeInSeconds || typeof effectiveTimeInSeconds !== "number") {
		// Check if effectiveTimeInSeconds is valid
		throw new Error("effectiveTimeInSeconds invalid");
	}
	const createTime = Math.floor(new Date().getTime() / 1000); // Get current time in seconds
	const tokenInfo = {
		// Create object with token information
		app_id: appId,
		user_id: userId,
		nonce: RndNum(-2147483648, 2147483647),
		ctime: createTime,
		expire: createTime + effectiveTimeInSeconds,
		payload: payload ?? "",
	};
	const plaintText = JSON.stringify(tokenInfo); // Convert tokenInfo object to JSON string
	const iv = makeRandomIv(); // Generate random 16 character string for iv
	const encryptBuf = aesEncrypt(plaintText, secret, iv); // Encrypt JSON string using AES encryption function
	const _a = [new Uint8Array(8), new Uint8Array(2), new Uint8Array(2)],
		b1 = _a[0],
		b2 = _a[1],
		b3 = _a[2];
	new DataView(b1.buffer).setBigInt64(0, BigInt(tokenInfo.expire), false); // Set expire time in binary format
	new DataView(b2.buffer).setUint16(0, iv.length, false); // Set length of iv in binary format
	new DataView(b3.buffer).setUint16(0, encryptBuf.byteLength, false); // Set length of encrypted information in binary format
	const buf = Buffer.concat([
		// Concatenate all binary data
		Buffer.from(b1),
		Buffer.from(b2),
		Buffer.from(iv),
		Buffer.from(b3),
		Buffer.from(encryptBuf),
	]);
	const dv = new DataView(Uint8Array.from(buf).buffer); // Create DataView object from binary data
	// console.log('-----------------');
	// console.log('-------getBigInt64----------', dv.getBigInt64(0));
	// console.log('-----------------');
	// console.log('-------getUint16----------', dv.getUint16(8));
	// console.log('-----------------');
	return "04" + Buffer.from(dv.buffer).toString("base64"); // Return final token string in Base64 format
}

export default function getZegoToken(id: string): string {
	const appId = parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID ?? "");
	const secret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET ?? "";
	const token = generateToken04(appId, id, secret, 3600, "");
	return token;
}
