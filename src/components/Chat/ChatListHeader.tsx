"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { BiDotsVerticalRounded, BiSolidMessageDetail } from "react-icons/bi";
import { BsFillMoonStarsFill, BsSunFill } from "react-icons/bs";
import { MdGroups2 } from "react-icons/md";
import { useRecoilState } from "recoil";

import { UserSession } from "@/lib/model";

import { sideBarState } from "../atoms/sideBar";

export default function ChatListHeader(): React.JSX.Element {
	const setPageType = useRecoilState(sideBarState)[1];
	const { systemTheme, theme, setTheme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const { data: session } = useSession() as { data: UserSession | undefined };
	return (
		<div className="flex h-16 items-center justify-between rounded-tl-lg bg-[#f0f2f5] px-4 py-3 dark:bg-[#222e35]">
			<div className="flex items-center space-x-4">
				<Image
					src={session?.user?.image || "/user.png"}
					alt="Profile"
					width={40}
					height={40}
					className="h-7 w-7 cursor-pointer rounded-full object-contain"
				/>
			</div>
			<div className="flex items-center space-x-6 text-[#54656f] dark:text-[#aebac1]">
				{theme === "dark" ? (
					<BsSunFill
						className="h-5 w-5 cursor-pointer"
						onClick={(): void => setTheme(isDark ? "light" : "dark")}
					/>
				) : (
					<BsFillMoonStarsFill
						className="h-5 w-5 cursor-pointer"
						onClick={(): void => setTheme(isDark ? "light" : "dark")}
					/>
				)}
				<MdGroups2 className="h-6 w-6 cursor-pointer" />
				<BiSolidMessageDetail className="h-6 w-6 cursor-pointer" onClick={(): void => setPageType("contact")} />
				<BiDotsVerticalRounded className="h-6 w-6 cursor-pointer" />
			</div>
		</div>
	);
}
