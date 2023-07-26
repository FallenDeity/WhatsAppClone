"use client";

import { Conversation, User } from "@prisma/client";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import Avatar from "react-avatar";
import { BiArrowBack } from "react-icons/bi";
import { BiFilter } from "react-icons/bi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useRecoilState } from "recoil";

import getUsers from "@/actions/getUsers";
import { slideIn } from "@/lib/motion";

import { conversationState } from "../atoms/conversationState";
import { sideBarState } from "../atoms/sideBar";

export default function ContactList(): React.JSX.Element {
	const setConversationState = useRecoilState(conversationState)[1];
	const setPageType = useRecoilState(sideBarState)[1];
	const [contacts, setContacts] = React.useState<Record<string, User[]>>({});
	const searchRef = React.useRef<HTMLInputElement>(null);
	const [searchResults, setSearchResults] = React.useState<User[]>([]);
	React.useEffect(() => {
		async function getContacts(): Promise<void> {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			const data = (await getUsers()) as User[];
			const contacts: Record<string, User[]> = {};
			data.forEach((user: User) => {
				const firstLetter = String(user.name)[0].toUpperCase();
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (contacts[firstLetter]) {
					contacts[firstLetter].push(user);
				} else {
					contacts[firstLetter] = [user];
				}
			});
			setContacts(contacts);
		}
		void getContacts();
	}, []);
	const handleSearch = (): void => {
		if (!searchRef.current) return;
		const value = searchRef.current.value;
		if (value.trim().length === 0) {
			setSearchResults([]);
			return;
		}
		const results = Object.values(contacts)
			.flat()
			.filter((user) => String(user.name).toLowerCase().includes(value.toLowerCase()));
		setSearchResults(results);
	};
	return (
		<motion.div
			exit={{ opacity: 0 }}
			className="z-30 flex h-full flex-col"
			variants={slideIn("left")}
			initial="hidden"
			whileInView="show"
			viewport={{ once: true }}
			animate="show">
			<div className="flex h-24 items-end bg-[#008069] px-3 py-4 text-white dark:bg-[#222e35] lg:rounded-tl-lg">
				<BiArrowBack
					className="h-6 w-6 cursor-pointer"
					onClick={(): void => {
						setPageType("default");
					}}
				/>
				<span className="ml-4 text-xl font-semibold">New Chat</span>
			</div>
			<div className="flex h-14 items-center gap-1 pl-5">
				<div className="flex flex-grow items-center gap-7 rounded-lg bg-[#f0f2f5] px-4 py-1.5 dark:bg-[#222e35]">
					<div>
						<FaMagnifyingGlass className="cursor-pointer text-sm text-[#54656f] dark:text-[#aebac1]" />
					</div>
					<div>
						<input
							ref={searchRef}
							onChange={handleSearch}
							type="text"
							placeholder="Search or start new chat"
							className="w-full bg-transparent text-sm text-[#54656f] placeholder-[#54656f] outline-none dark:text-[#aebac1] dark:placeholder-[#aebac1]"
						/>
					</div>
				</div>
				<div className="pl-3 pr-5">
					<BiFilter className="cursor-pointer text-xl text-[#54656f] dark:text-[#aebac1]" />
				</div>
			</div>
			<div className="flex h-[80vh] w-full flex-grow flex-col space-y-2 overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 lg:h-[60vh]">
				<span className="text-md mt-5 px-8 py-2 font-semibold text-[#008069] dark:text-[#008069]">
					CONTACTS ON WHATSAPP
				</span>
				{searchResults.length > 0 &&
					searchResults.map((user) => (
						<div
							onClick={(): void => {
								void axios
									.post("/api/conversations", {
										userId: user.id,
									})
									.then((res) => {
										if (res.status === 200) {
											setConversationState((res.data as Conversation).id);
											setPageType("default");
										}
									});
							}}
							key={user.id}
							className="flex h-20 w-full cursor-pointer items-center justify-between px-4 transition-all duration-300 ease-in-out hover:bg-[#f0f2f5] dark:hover:bg-[#222e35]">
							<div className="flex h-full w-full items-center space-x-4">
								{user.image ? (
									<Image
										src={user.image || "/user.png"}
										alt="Profile"
										width={40}
										height={40}
										className="h-15 w-15 cursor-pointer rounded-full object-contain"
									/>
								) : (
									<Avatar
										name={user.name ?? ""}
										size="40"
										className="h-12 w-12 cursor-pointer rounded-full object-contain p-0"
									/>
								)}
								<div className="flex h-full w-full flex-col justify-center border-y">
									<span className="text-md font-semibold text-[#1d2129] dark:text-[#e4e6eb]">
										{user.name}
									</span>
									<span className="line-clamp-1 text-xs font-normal text-[#54656f] dark:text-[#aebac1]">
										{user.about}
									</span>
								</div>
							</div>
						</div>
					))}
				{searchResults.length === 0 &&
					Object.keys(contacts).map((key) => (
						<div key={key} className="flex w-full flex-col">
							<span className="my-5 px-8 py-2 text-sm font-semibold text-[#008069] dark:text-[#008069]">
								{key}
							</span>
							{contacts[key].map((user) => (
								<div
									onClick={(): void => {
										void axios
											.post("/api/conversations", {
												userId: user.id,
											})
											.then((res) => {
												if (res.status === 200) {
													setConversationState((res.data as Conversation).id);
													setPageType("default");
												}
											});
									}}
									key={user.id}
									className="flex h-20 w-full cursor-pointer items-center justify-between px-4 transition-all duration-300 ease-in-out hover:bg-[#f0f2f5] dark:hover:bg-[#222e35]">
									<div className="flex h-full w-full items-center space-x-4">
										{user.image ? (
											<Image
												src={user.image || "/user.png"}
												alt="Profile"
												width={40}
												height={40}
												className="h-15 w-15 cursor-pointer rounded-full object-contain"
											/>
										) : (
											<Avatar
												name={user.name ?? ""}
												size="40"
												className="h-12 w-12 cursor-pointer rounded-full object-contain p-0"
											/>
										)}
										<div className="flex h-full w-full flex-col justify-center border-y">
											<span className="text-md font-semibold text-[#1d2129] dark:text-[#e4e6eb]">
												{user.name}
											</span>
											<span className="line-clamp-1 text-xs font-normal text-[#54656f] dark:text-[#aebac1]">
												{user.about}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					))}
			</div>
		</motion.div>
	);
}
