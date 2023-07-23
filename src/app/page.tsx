import React from "react";

import AuthForm from "@/components/AuthForm";

export default function Home(): React.JSX.Element {
	console.log(process.env.NODE_ENV);
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 dark:bg-gray-800 sm:px-6 lg:px-8">
			<AuthForm />
		</div>
	);
}
