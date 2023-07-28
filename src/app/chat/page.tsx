import { Metadata } from "next";
import React from "react";

import Chat from "@/components/Chat";
import { meta } from "@/lib/utils";

export const metadata: Metadata = meta;

export default function ChatPage(): React.JSX.Element {
	return (
		<>
			<Chat />
		</>
	);
}
