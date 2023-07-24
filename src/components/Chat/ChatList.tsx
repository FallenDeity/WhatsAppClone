import React from "react";

import ChatListHeader from "./ChatListHeader";
import List from "./List";
import SearchBar from "./SearchBar";

export default function ChatList(): React.JSX.Element {
	return (
		<div className="z-20 flex max-h-screen flex-col rounded-l-lg bg-white dark:bg-[#111b21]">
			<ChatListHeader />
			<SearchBar />
			<List />
		</div>
	);
}
