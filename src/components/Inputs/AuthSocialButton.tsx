import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";

interface AuthSocialButtonProps {
	className?: string;
	icon: IconType;
	onClick: () => void;
}

const AuthSocialButton: React.FC<AuthSocialButtonProps> = ({
	icon: Icon,
	onClick,
	className,
}: AuthSocialButtonProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={twMerge(
				"mt-4 inline-flex w-full transform items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition duration-300 ease-in-out hover:scale-105 focus:outline-none",
				className
			)}>
			<Icon className="h-5 w-5" />
		</button>
	);
};

export default AuthSocialButton;
