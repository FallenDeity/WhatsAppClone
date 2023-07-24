import Lottie from "lottie-react";
import React from "react";

import animationData from "@/assets/animation_lkgamb4g.json";

export default function Empty(): React.JSX.Element {
	return (
		<div className="z-20 flex h-[100vh] max-h-screen w-full flex-col items-center justify-center border border-b-4 border-[#e9edef] border-b-[#25d366] bg-[#f0f2f5] dark:border-[#313d45] dark:border-b-[#00a884] dark:bg-[#222e35] lg:h-[95vh] lg:rounded-r-lg">
			<Lottie
				animationData={animationData}
				loop={true}
				height={500}
				width={500}
				className="h-[300px] w-[300px]"
			/>
		</div>
	);
}
