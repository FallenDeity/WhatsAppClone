/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import Image from "next/image";
import React from "react";
import { BsFillCameraVideoFill, BsThreeDotsVertical } from "react-icons/bs";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdCall } from "react-icons/md";

import { FullConversationType } from "@/lib/types";

import AvatarGroup from "../AvatarGroup";

export default function ChatHeader({
	conversation,
	email,
}: {
	conversation?: FullConversationType | null;
	email: string;
}): React.JSX.Element {
	return (
		<div className="flex h-16 w-full items-center justify-between rounded-tr-lg bg-[#f0f2f5] px-4 py-4 dark:bg-[#222e35]">
			<div className="flex items-center space-x-4">
				{conversation?.isGroup ? (
					<AvatarGroup users={conversation.users} />
				) : (
					<Image
						src={conversation?.users.filter((user) => user.email !== email)[0].image || "/user.png"}
						alt="Profile"
						width={40}
						height={40}
						className="h-7 w-7 cursor-pointer rounded-full object-contain"
					/>
				)}
				<div className="flex flex-col">
					<span className="text-sm font-semibold text-[#1d2129] dark:text-[#e4e6eb]">
						{conversation?.name || conversation?.users.filter((user) => user.email !== email)[0].name}
					</span>
					<span className="text-xs font-normal text-[#54656f] dark:text-[#aebac1]">Online</span>
				</div>
			</div>
			<div className="flex items-center space-x-6 text-[#54656f] dark:text-[#aebac1]">
				<MdCall className="h-5 w-5 cursor-pointer" />
				<BsFillCameraVideoFill className="h-5 w-5 cursor-pointer" />
				<FaMagnifyingGlass className="h-5 w-5 cursor-pointer" />
				<BsThreeDotsVertical className="h-5 w-5 cursor-pointer" />
			</div>
		</div>
	);
}
