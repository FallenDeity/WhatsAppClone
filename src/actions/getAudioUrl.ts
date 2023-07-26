"use server";

import { v2 } from "cloudinary";

export async function getAudioUrl(file: string): Promise<string> {
	try {
		const response = (await v2.uploader.unsigned_upload(
			file,
			process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
			{
				resource_type: "video",
				cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
			}
		)) as { secure_url: string };
		return response.secure_url;
	} catch (error) {
		console.log(error, "AUDIO_UPLOAD_ERROR");
		return "";
	}
}
