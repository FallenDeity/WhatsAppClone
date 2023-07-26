"use client";

import { Channel, Members } from "pusher-js";
import { useEffect, useState } from "react";

import { pusherClient } from "@/lib/pusher";

import useActiveList from "./useActiveList";

const useActiveChannel = (): void => {
	const { set, add, remove } = useActiveList();
	const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

	useEffect(() => {
		let channel = activeChannel;

		if (!channel) {
			channel = pusherClient.subscribe("presence-messenger");
			setActiveChannel(channel);
		}

		channel.bind("pusher:subscription_succeeded", (members: Members) => {
			const initialMembers: string[] = [];

			members.each((member: Record<string, string>) => initialMembers.push(member.id));
			set(initialMembers);
		});

		channel.bind("pusher:member_added", (member: Record<string, string>) => {
			add(member.id);
		});

		channel.bind("pusher:member_removed", (member: Record<string, string>) => {
			remove(member.id);
		});

		return (): void => {
			if (activeChannel) {
				pusherClient.unsubscribe("presence-messenger");
				setActiveChannel(null);
			}
		};
	}, [activeChannel, set, add, remove]);
};

export default useActiveChannel;
