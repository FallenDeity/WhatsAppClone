"use server";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import getSession from "./getSession";

const getCurrentUser = async (): Promise<User | null> => {
	try {
		const session = await getSession();

		if (!session?.user?.email) {
			return null;
		}

		const currentUser = await prisma.user.findUnique({
			where: {
				email: session.user.email,
			},
		});

		if (!currentUser) {
			return null;
		}

		return currentUser;
	} catch (error) {
		console.log(error, "CURRENT_USER_FETCH_ERROR");
		return null;
	}
};

export default getCurrentUser;
