"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Avatar from "react-avatar";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useRecoilState } from "recoil";

import { Checkbox } from "@/components/ui/checkbox";
import { FullMessageType } from "@/lib/types";
import { formatMessageDate } from "@/lib/utils";

import { messageSearch } from "../atoms/messageSearch";

export default function SearchMessages({ messages }: { messages: FullMessageType[] }): React.JSX.Element {
	const searchRef = React.useRef<HTMLInputElement>(null);
	const setMessageSearch = useRecoilState(messageSearch)[1];
	const [viewMedia, setViewMedia] = React.useState(false);
	const [searchResults, setSearchResults] = React.useState<FullMessageType[]>([]);
	React.useEffect(() => {
		if (!viewMedia) {
			setSearchResults([]);
			return;
		}
		const results = messages.filter((message) => message.audio ?? message.image);
		setSearchResults(results);
	}, [viewMedia]);
	const handleSearch = React.useCallback(() => {
		if (!searchRef.current) return;
		setViewMedia(false);
		const value = searchRef.current.value;
		if (value.trim().length === 0) {
			setSearchResults([]);
			return;
		}
		const results = messages.filter((message) => message.body?.includes(value));
		setSearchResults(results);
	}, [messages]);
	return (
		<div className="z-20 flex h-[100vh] max-h-screen w-full flex-col items-center border border-l-0 border-[#e9edef] bg-white dark:border-[#313d45] dark:bg-[#111b21] lg:h-[95vh] lg:rounded-r-lg">
			<div className="flex h-16 w-full items-center bg-[#f0f2f5] px-4 py-3 dark:bg-[#222e35] lg:rounded-tr-lg">
				<X
					onClick={(): void => setMessageSearch(false)}
					className="cursor-pointer text-xl text-[#54656f] dark:text-[#aebac1]"
				/>
				<span className="w-full text-center text-sm text-[#54656f] dark:text-[#aebac1]">Search Messages</span>
			</div>
			<div className="mt-3 flex h-14 w-full items-center gap-1 pl-5">
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
				<div className="flex items-center space-x-2 pl-3 pr-5">
					<Checkbox id="media" checked={viewMedia} onClick={(): void => setViewMedia(!viewMedia)} />
					<label
						htmlFor="media"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Media
					</label>
				</div>
			</div>
			<div className="flex h-[90vh] w-full flex-grow flex-col overflow-y-auto border-t border-[#e9edef] pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:border-[#313d45] dark:scrollbar-thumb-gray-700 lg:h-[80vh]">
				{searchResults.length === 0 && (
					<div className="flex h-full flex-col items-center justify-center">
						<span className="text-md text-[#54656f] dark:text-[#aebac1]">No results found</span>
					</div>
				)}
				{searchResults.length > 0 &&
					searchResults.map((message) => (
						<div
							key={message.id}
							className="flex h-[70px] cursor-pointer flex-col items-center justify-between border-b px-4 py-2  transition-all duration-300 ease-in-out hover:bg-[#f0f2f5] dark:hover:bg-[#222e35]">
							<div className="flex h-full w-full flex-row items-center justify-center">
								{message.sender.image ? (
									<Image
										src={message.sender.image}
										alt="Profile"
										width={40}
										height={40}
										className="h-15 w-15 cursor-pointer rounded-full object-contain"
									/>
								) : (
									<Avatar
										name={message.sender.name ?? ""}
										size="40"
										className="h-12 w-12 cursor-pointer rounded-full object-contain p-0"
									/>
								)}
								<div className="ml-3 flex w-full flex-row justify-between space-x-3">
									<div className="flex flex-col justify-center space-y-2">
										<span className="text-xs">{message.sender.name}</span>
										<div className="line-clamp-1 flex w-48 flex-row justify-between space-x-3 lg:w-60">
											{message.body && <span className="text-xs">{message.body}</span>}
											{(message.image || message.audio) && (
												<Link
													href={message.image ?? message.audio ?? ""}
													target="_blank"
													rel="noreferrer">
													<span className="text-xs text-blue-500">View Attachment</span>
												</Link>
											)}
										</div>
									</div>
									<span className="text-xs">{formatMessageDate(message.createdAt)}</span>
								</div>
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
