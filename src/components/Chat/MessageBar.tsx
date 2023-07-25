"use client";

import axios from "axios";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { CldUploadButton } from "next-cloudinary";
import { useTheme } from "next-themes";
import React from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa6";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";

export default function MessageBar({ id }: { id: string }): React.JSX.Element {
	const { resolvedTheme } = useTheme();
	const textRef = React.useRef<HTMLInputElement>(null);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [text, setText] = React.useState<string>("");
	const [showEmoji, setShowEmoji] = React.useState<boolean>(false);
	const handleSend = (e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
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
	};
	const handleUpload = (result: { info: { secure_url: string } }): void => {
		if (loading) return;
		setLoading(true);
		void axios
			.post("/api/messages", {
				conversationId: id,
				image: result.info.secure_url,
			})
			.then(() => {
				setLoading(false);
			});
	};
	const handleEmojiMenu = (): void => {
		setShowEmoji((prev) => !prev);
	};
	const handleEmojiClick = (emoji: EmojiClickData): void => {
		setText((prev) => prev + emoji.emoji);
	};
	return (
		<div className="relative flex w-full items-center gap-6 border-b-4 border-b-[#25d366] bg-[#f0f2f5] px-4 py-2 dark:border-b-[#00a884] dark:bg-[#222e35]">
			<div className="flex gap-6 text-[#54656f] dark:text-[#aebac1]">
				<BsEmojiSmile
					title="Emoji"
					id="emoji-open"
					onClick={handleEmojiMenu}
					className="h-5 w-5 cursor-pointer"
				/>
				<CldUploadButton
					onUpload={handleUpload}
					uploadPreset={process.env.CLOUDINARY_UPLOAD_PRESET ?? ""}
					options={{ maxFiles: 1, styles: {} }}>
					<ImAttachment title="Attach File" className="h-5 w-5 cursor-pointer" />
				</CldUploadButton>
				{showEmoji && (
					<div className="absolute bottom-20 left-5 z-40">
						<EmojiPicker
							onEmojiClick={handleEmojiClick}
							lazyLoadEmojis={true}
							theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
						/>
					</div>
				)}
			</div>
			<form onSubmit={handleSend} className="flex w-full items-center justify-center gap-6">
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
						<MdSend className="h-full w-full" />
					</button>
					<FaMicrophone className="h-5 w-5 cursor-pointer" />
				</div>
			</form>
		</div>
	);
}
