import { format } from "date-fns";
import Image from "next/image";
import React from "react";

import { FullMessageType } from "@/lib/types";

export default function MessageContainer({
	messages,
	email,
}: {
	messages: FullMessageType[];
	email: string;
}): React.JSX.Element {
	return (
		<div className="relative flex h-full w-full flex-col overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-700">
			<div className="absolute left-0 top-0 z-0 h-full w-full bg-chat-background bg-fixed bg-repeat opacity-50 dark:opacity-5" />
			<div className="relative bottom-0 left-0 z-40 mx-10 my-6">
				<div className="flex w-full">
					<div className="flex w-full flex-col justify-end gap-2 overflow-auto">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex flex-col-reverse ${
									message.sender.email === email ? "items-end" : "items-start"
								}`}>
								<div
									className={`flex max-w-[45%] items-center gap-2 rounded-md px-2 py-[3px] text-sm text-[#111b21] dark:text-[#daedef] ${
										message.sender.email === email
											? "bg-[#d9fdd3] dark:bg-[#005c4b]"
											: "mx-6 bg-[#ffffff] dark:bg-[#202c33]"
									}`}>
									<span className="mx-1 break-all">{message.body}</span>
									<div className="flex items-end gap-1">
										<span className="min-w-fit pt-2 text-[10px] font-light">
											{format(new Date(message.createdAt), "hh:mm aa")}
										</span>
									</div>
								</div>
								{message.sender.email !== email && (
									<div className="flex flex-row items-center gap-1">
										<Image
											src={message.sender.image || "/user.png"}
											alt={message.sender.name ?? ""}
											width={20}
											height={20}
											className="rounded-full"
										/>
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
