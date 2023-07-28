"use client";

import { User } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Avatar from "react-avatar";
import { BsCheck2, BsCheck2All } from "react-icons/bs";

import { FullMessageType } from "@/lib/types";
import { formatMessageDate } from "@/lib/utils";

import VoiceMessage from "./VoiceMessage";

export default function MessageContainer({
	users,
	id,
	messages,
	email,
}: {
	users: User[];
	id: string;
	messages: FullMessageType[];
	email: string;
}): React.JSX.Element {
	const [image, setImage] = React.useState<string | null>(null);
	React.useEffect(() => {
		void axios.post(`/api/conversations/${id}/seen`);
	}, [messages]);
	return (
		<div className="relative flex h-full w-full flex-col-reverse overflow-y-auto scroll-smooth scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-700">
			<div className="z-1 fixed left-0 top-0 h-full w-full bg-chat-background bg-fixed opacity-50 dark:opacity-5" />
			<div className="relative bottom-0 left-0 z-40 px-2 py-6 lg:px-10">
				{image && (
					<div className="z-80 fixed left-0 top-0 flex h-screen w-screen flex-col items-center justify-center bg-black/70">
						<button
							className="z-90 fixed right-8 top-6 text-5xl font-bold text-white"
							onClick={(): void => setImage("")}>
							&times;
						</button>
						<Image
							src={image}
							alt="image"
							width={800}
							height={600}
							className="max-h-[600px] max-w-[800px] object-contain"
						/>
						<Link
							href={image}
							passHref
							target="_blank"
							rel="noopener noreferrer"
							className="mt-1 text-neutral-500 transition-all duration-300 ease-in hover:text-blue-500">
							open original
						</Link>
					</div>
				)}
				<div className="flex w-full">
					<div className="flex w-full flex-col justify-end gap-2 overflow-auto">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex flex-col-reverse ${
									message.sender.email === email ? "items-end" : "items-start"
								}`}>
								{message.image && (
									<div
										className={`rounded-lg p-1 ${
											message.sender.email === email
												? "bg-[#d9fdd3] dark:bg-[#005c4b]"
												: "mx-6 bg-[#ffffff] dark:bg-[#202c33]"
										}`}>
										<div className="relative">
											<Image
												onClick={(): void => {
													setImage(message.image);
												}}
												src={message.image}
												alt={message.sender.name ?? ""}
												width={200}
												height={200}
												className="h-full max-h-[600px] w-full max-w-[400px] rounded-lg object-contain"
											/>
											<div className="absolute bottom-1 right-1 flex flex-row items-end gap-1">
												<span className="min-w-fit pt-2 text-[10px] font-light">
													{formatMessageDate(message.createdAt)}
												</span>
												{message.sender.email === email &&
													(message.seenIds.length === users.length ? (
														<BsCheck2All className="text-blue-500" />
													) : (
														<BsCheck2 className="text-gray-500" />
													))}
											</div>
										</div>
									</div>
								)}
								{message.audio && <VoiceMessage users={users} email={email} message={message} />}
								{message.body && (
									<div
										className={`flex max-w-[90%] items-center gap-2 rounded-md px-2 py-[3px] text-sm text-[#111b21] dark:text-[#daedef] sm:max-w-[70%] md:max-w-[45%] ${
											message.sender.email === email
												? "bg-[#d9fdd3] dark:bg-[#005c4b]"
												: "mx-6 bg-[#ffffff] dark:bg-[#202c33]"
										}`}>
										<span className="mx-1 break-all">{message.body}</span>
										<div className="flex flex-row items-end gap-1">
											<span className="min-w-fit pt-2 text-[10px] font-light">
												{formatMessageDate(message.createdAt)}
											</span>
											{message.sender.email === email &&
												(message.seenIds.length === users.length ? (
													<BsCheck2All className="text-blue-500" />
												) : (
													<BsCheck2 className="text-gray-500" />
												))}
										</div>
									</div>
								)}
								{message.sender.email !== email && (
									<div className="flex flex-row items-center gap-1">
										{message.sender.image ? (
											<Image
												src={message.sender.image || "/user.png"}
												alt={message.sender.name ?? ""}
												width={20}
												height={20}
												className="rounded-full"
											/>
										) : (
											<Avatar
												name={message.sender.name ?? ""}
												size="20"
												className="rounded-full p-0"
											/>
										)}
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{message.sender.name}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
