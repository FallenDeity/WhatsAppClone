import { User } from "@prisma/client";
import Image from "next/image";
import Avatar from "react-avatar";

import { FullConversationType } from "@/lib/types";

interface AvatarGroupProps {
	conversation: FullConversationType;
	users?: User[];
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ conversation, users = [] }) => {
	const slicedUsers = users.slice(0, 3);
	const positionMap = {
		0: "top-0 left-[10px]",
		1: "bottom-0",
		2: "bottom-0 right-0",
	};
	return (
		<>
			{conversation.logo ? (
				<Image
					src={conversation.logo || "/user.png"}
					alt="Profile"
					width={40}
					height={40}
					className="h-10 w-10 cursor-pointer rounded-full object-contain"
				/>
			) : (
				<div className="relative h-11 w-11">
					{slicedUsers.map((user, index) => (
						<div
							key={user.id}
							className={`
            absolute
            inline-block
            h-[21px]
            w-[21px]
            overflow-hidden
            rounded-full
            ${positionMap[index as keyof typeof positionMap]}
          `}>
							{user.image ? (
								<Image fill src={user.image || "/user.png"} alt="Avatar" className="h-full w-full" />
							) : (
								<Avatar name={user.name ?? ""} size="100%" round={true} className="h-full w-full" />
							)}
						</div>
					))}
				</div>
			)}
		</>
	);
};

export default AvatarGroup;
