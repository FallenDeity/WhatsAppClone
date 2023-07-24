"use client";

import Lottie from "lottie-react";
import React from "react";

import animationData from "@/assets/animation_lkgam3yw.json";

export default function PulseLoader(): React.JSX.Element {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-100 py-12 dark:bg-gray-800 sm:px-6 lg:px-8">
			<Lottie animationData={animationData} loop={true} height={500} width={500} />
		</div>
	);
}
