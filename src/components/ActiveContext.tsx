"use client";

import useActiveChannel from "@/hooks/useActiveChannel";

const ActiveStatus = (): null => {
	useActiveChannel();
	return null;
};

export default ActiveStatus;
