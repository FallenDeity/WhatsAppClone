"use client";

import Lottie from "lottie-react";
import React from "react";

import animationData from "@/assets/animation_lkgamb4g.json";

export default function DrawLoader(): React.JSX.Element {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 dark:bg-gray-800 sm:px-6 lg:px-8">
			<Lottie animationData={animationData} loop={true} height={50} width={50} className="h-36 w-36" />
		</div>
	);
}
