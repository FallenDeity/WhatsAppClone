"use server";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import getSession from "./getSession";

const getUsers = async (): Promise<User[]> => {
	const session = await getSession();

	if (!session?.user?.email) {
		return [];
	}

	try {
		const users = await prisma.user.findMany({
			orderBy: {
				name: "asc",
			},
			where: {
				NOT: {
					email: session.user.email,
				},
			},
		});
		return users;
	} catch (error) {
		console.log(error, "USERS_FETCH_ERROR");
		return [];
	}
};

export default getUsers;
