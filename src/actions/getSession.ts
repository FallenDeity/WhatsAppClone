"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserSession } from "@/lib/model";

export default async function getSession(): Promise<UserSession | null> {
	return await getServerSession(authOptions);
}
