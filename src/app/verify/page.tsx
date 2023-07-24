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
		<div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-100 py-12 dark:bg-gray-800 sm:px-6 lg:px-8">
			<Verification token={token} />
		</div>
	);
}
