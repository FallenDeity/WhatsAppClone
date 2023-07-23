import clsx from "clsx";

interface ButtonProps {
	type?: "button" | "submit" | "reset" | undefined;
	fullWidth?: boolean;
	children?: React.ReactNode;
	onClick?: () => void;
	secondary?: boolean;
	danger?: boolean;
	disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
	type = "button",
	fullWidth,
	children,
	onClick,
	secondary,
	danger,
	disabled,
}) => {
	return (
		<button
			onClick={onClick}
			type={type}
			disabled={disabled}
			className={clsx(
				`flex h-9 justify-center rounded-md px-3 py-2 text-sm font-semibold transition-all duration-300 ease-in-out  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`,
				disabled && "cursor-not-allowed opacity-50",
				fullWidth && "w-full",
				secondary ? "text-gray-900 dark:text-gray-100" : "text-white",
				danger &&
					"bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 dark:focus-visible:outline-rose-700",
				!secondary &&
					!danger &&
					"bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus-visible:outline-sky-700"
			)}>
			{children}
		</button>
	);
};

export default Button;
