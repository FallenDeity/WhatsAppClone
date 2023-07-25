import React from "react";

import Verification from "@/components/Verify";

interface VerifyPageProps {
	searchParams: {
		token?: string;
	};
}

export default function VerifyPage({ searchParams: params }: VerifyPageProps): React.JSX.Element {
	const token = params.token;
	return (
		<div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#f0f2f5] to-[#efeae2] py-12 dark:from-[#222e35] dark:to-[#0b141a] sm:px-6 lg:px-8">
			<Verification token={token} />
		</div>
	);
}
