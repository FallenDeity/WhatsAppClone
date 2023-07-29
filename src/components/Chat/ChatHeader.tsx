/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Avatar from "react-avatar";
import { BiTrash } from "react-icons/bi";
import { BsArrowLeft, BsFillCameraVideoFill, BsThreeDotsVertical } from "react-icons/bs";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdCall } from "react-icons/md";
import { PulseLoader } from "react-spinners";
import { useRecoilState } from "recoil";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useActiveList from "@/hooks/useActiveList";
import { FullConversationType } from "@/lib/types";
import { formatMessageDate } from "@/lib/utils";

import { callState } from "../atoms/CallState";
import { conversationState } from "../atoms/conversationState";
import { messageSearch } from "../atoms/messageSearch";
import AvatarGroup from "../AvatarGroup";

export default function ChatHeader({
	conversation,
	email,
}: {
	conversation?: FullConversationType | null;
	email: string;
}): React.JSX.Element {
	const { members } = useActiveList();
	const otherUser = React.useMemo(() => {
		if (!conversation) {
			return null;
		}
		return conversation.users.filter((user) => user.email !== email)[0];
	}, [conversation, email]);
	const setCallState = useRecoilState(callState)[1];
	const [MessageSearch, setMessageSearch] = useRecoilState(messageSearch);
	const setConversationState = useRecoilState(conversationState)[1];
	const [modalOpen, setModalOpen] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const handleDelete = (): void => {
		if (!conversation) return;
		if (loading) return;
		setLoading(true);
		void axios
			.delete(`api/conversations/${conversation.id}`)
			.then(() => {
				setConversationState("");
				setModalOpen(false);
				setLoading(false);
			})
			.finally(() => {
				setModalOpen(false);
				setLoading(false);
			});
	};
	return (
		<div
			className={`z-20 flex h-16 w-full items-center justify-between ${
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				!MessageSearch && "lg:rounded-tr-lg"
			} bg-[#f0f2f5] px-4 py-4 dark:bg-[#222e35]`}>
			<div className="flex items-center space-x-4">
				<BsArrowLeft
					onClick={(): void => {
						setMessageSearch(false);
						setConversationState("");
						setModalOpen(false);
						setLoading(false);
					}}
					className="h-5 w-5 cursor-pointer"
				/>
				{conversation?.isGroup ? (
					<AvatarGroup conversation={conversation} users={conversation.users} />
				) : otherUser?.image ? (
					<Image
						src={otherUser.image || "/user.png"}
						alt="Profile"
						width={40}
						height={40}
						className="h-10 w-10 cursor-pointer rounded-full object-contain"
					/>
				) : (
					<Avatar
						name={otherUser?.name ?? ""}
						size="40"
						className="h-7 w-7 cursor-pointer rounded-full object-contain p-0"
					/>
				)}
				<div className="flex flex-col">
					<span className="text-sm font-semibold text-[#1d2129] dark:text-[#e4e6eb]">
						{conversation?.name || otherUser?.name}
					</span>
					<span className="line-clamp-1 text-xs font-normal text-[#54656f] dark:text-[#aebac1]">
						{conversation?.isGroup
							? conversation.users.map((user) => user.name).join(", ")
							: members.includes(otherUser?.email ?? "")
							? "Online"
							: // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							otherUser?.lastSeen
							? `Last seen ${formatMessageDate(otherUser.lastSeen)}`
							: "Offline"}
					</span>
				</div>
			</div>
			<div className="flex items-center space-x-6 text-[#54656f] dark:text-[#aebac1]">
				{!conversation?.isGroup && (
					<>
						<MdCall
							onClick={(): void =>
								setCallState({
									voiceCall: { user: otherUser, outgoing: true, roomID: Date.now(), type: "voice" },
								})
							}
							className="h-5 w-5 cursor-pointer"
						/>
						<BsFillCameraVideoFill
							onClick={(): void =>
								setCallState({
									videoCall: { user: otherUser, outgoing: true, roomID: Date.now(), type: "video" },
								})
							}
							className="h-5 w-5 cursor-pointer"
						/>
					</>
				)}
				<FaMagnifyingGlass
					onClick={(): void => setMessageSearch((prev) => !prev)}
					className="h-5 w-5 cursor-pointer"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger className="border-0 outline-none focus:outline-none">
						<BsThreeDotsVertical className="h-5 w-5 cursor-pointer" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="mt-2 w-56 border-[#e9edef] bg-[#f0f2f5] dark:border-[#313d45] dark:bg-[#222e35]">
						<DropdownMenuLabel className="text-center">Chat</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="cursor-normal focus:bg-normal flex w-full flex-col items-center justify-center">
							{conversation?.isGroup ? (
								<AvatarGroup conversation={conversation} users={conversation.users} />
							) : otherUser?.image ? (
								<Image
									src={otherUser.image || "/user.png"}
									alt="Profile"
									width={40}
									height={40}
									className="h-10 w-10 cursor-pointer rounded-full object-contain"
								/>
							) : (
								<Avatar
									name={otherUser?.name ?? ""}
									size="40"
									className="h-7 w-7 cursor-pointer rounded-full object-contain p-0"
								/>
							)}
							<span className="mt-2 text-sm font-semibold text-[#1d2129] dark:text-[#e4e6eb]">
								<Link href={`mailto:${otherUser?.email ?? ""}`}>
									{conversation?.name || otherUser?.name}
								</Link>
								{!conversation?.isGroup && (
									<span className="text-xs font-normal text-[#54656f] dark:text-[#aebac1]">
										{" "}
										• {members.includes(otherUser?.email ?? "") ? "Online" : "Offline"}
									</span>
								)}
							</span>
							<span className="mt-2 text-xs font-normal text-[#54656f] dark:text-[#aebac1]">
								Joined {formatMessageDate(conversation?.createdAt ?? new Date())}
							</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="mt-4 flex w-full flex-row-reverse justify-between hover:bg-[#b5b5b7] focus:bg-[#b5b5b7] dark:hover:bg-[#374650] dark:focus:bg-[#374650]"
							onClick={(): void => setModalOpen(true)}>
							<BiTrash className="h-5 w-5 cursor-pointer" />
							<span className="ml-2">Delete chat</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<AlertDialog open={modalOpen}>
				<AlertDialogContent className="bg-[#f0f2f5] dark:bg-[#222e35]">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete this chat and all messages in it.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={(): void => setModalOpen(false)}
							className="m-0 border-0 bg-[#e9edef] py-1 text-[#1d2129] transition-all duration-300 ease-in-out hover:bg-[#dfe3e6] dark:bg-[#313d45] dark:text-[#e4e6eb] dark:hover:bg-[#374650]">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={loading}
							className="bg-red-500 text-white transition-all duration-300 ease-in-out hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
							onClick={handleDelete}>
							{loading ? <PulseLoader size={8} color="#fff" /> : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
