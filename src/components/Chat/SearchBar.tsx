import React from "react";
import { BiFilter } from "react-icons/bi";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function SearchBar({
	ref,
	callback,
}: {
	ref: React.RefObject<HTMLInputElement>;
	callback: () => void;
}): React.JSX.Element {
	return (
		<div className="flex h-14 items-center gap-1 pl-5">
			<div className="flex flex-grow items-center gap-7 rounded-lg bg-[#f0f2f5] px-4 py-1.5 dark:bg-[#222e35]">
				<div>
					<FaMagnifyingGlass className="cursor-pointer text-sm text-[#54656f] dark:text-[#aebac1]" />
				</div>
				<div>
					<input
						ref={ref}
						onChange={callback}
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
	);
}
