"use client";

import axios from "axios";
import React from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa6";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";

export default function MessageBar({ id }: { id: string }): React.JSX.Element {
	const textRef = React.useRef<HTMLInputElement>(null);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [text, setText] = React.useState<string>("");
	const handleSend = React.useCallback(() => {
		if (loading) return;
		if (!textRef.current || textRef.current.value.trim() === "") {
			return;
		}
		setLoading(true);
		void axios
			.post("/api/messages", {
				conversationId: id,
				message: textRef.current.value,
			})
			.then(() => {
				setText("");
				setLoading(false);
			});
	}, []);
	return (
		<div className="relative flex w-full items-center gap-6 bg-[#f0f2f5] px-4 py-2 dark:bg-[#222e35]">
			<div className="flex gap-6 text-[#54656f] dark:text-[#aebac1]">
				<BsEmojiSmile className="h-5 w-5 cursor-pointer" />
				<ImAttachment className="h-5 w-5 cursor-pointer" />
			</div>
			<div className="flex h-10 w-full items-center rounded-lg">
				<input
					onChange={(e): void => setText(e.target.value)}
					ref={textRef}
					value={text}
					placeholder="Type a message"
					className="flex h-10 w-full overflow-y-auto rounded-lg bg-white px-5 text-sm scrollbar-hide focus:outline-none dark:bg-[#313d45] dark:text-[#e4e6eb]"
				/>
			</div>
			<div className="flex gap-6 text-[#54656f] dark:text-[#aebac1]">
				<button
					type="submit"
					disabled={loading}
					className="h-5 w-5 cursor-pointer disabled:animate-pulse disabled:cursor-not-allowed">
					<MdSend onClick={handleSend} className="h-full w-full" />
				</button>
				<FaMicrophone className="h-5 w-5 cursor-pointer" />
			</div>
		</div>
	);
}
