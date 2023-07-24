"use client";

import { Conversation, User } from "@prisma/client";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { BiArrowBack } from "react-icons/bi";
import { useRecoilState } from "recoil";

import getUsers from "@/actions/getUsers";
import { slideIn } from "@/lib/motion";

import { conversationState } from "../atoms/conversationState";
import { sideBarState } from "../atoms/sideBar";
import SearchBar from "./SearchBar";

export default function ContactList(): React.JSX.Element {
	const setConversationState = useRecoilState(conversationState)[1];
	const setPageType = useRecoilState(sideBarState)[1];
	const [contacts, setContacts] = React.useState<Record<string, User[]>>({});
	React.useEffect(() => {
		async function getContacts(): Promise<void> {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			const data = (await getUsers()) as User[];
			const contacts: Record<string, User[]> = {};
			data.forEach((user: User) => {
				const firstLetter = String(user.name)[0].toUpperCase();
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
			<SearchBar />
			<div className="flex h-[80vh] w-full flex-grow flex-col space-y-2 overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 lg:h-[60vh]">
				<span className="text-md mt-5 px-8 py-2 font-semibold text-[#008069] dark:text-[#008069]">
					CONTACTS ON WHATSAPP
				</span>
				{Object.keys(contacts).map((key) => (
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
									<Image
										src={user.image || "/user.png"}
										alt="Profile"
										width={40}
										height={40}
										className="h-12 w-12 cursor-pointer rounded-full object-contain"
									/>
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
