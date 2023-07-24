import React from "react";

export default function List(): React.JSX.Element {
	return (
		<div className="flex h-[80vh] flex-grow flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
			{Array.from({ length: 100 }).map((_, i) => (
				<div className="flex w-full flex-row p-5">{i}</div>
			))}
		</div>
	);
}
