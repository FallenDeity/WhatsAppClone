import { User } from "@prisma/client";
import { atom } from "recoil";

export interface Call {
	outgoing?: boolean;
	roomID?: number;
	user?: User | null;
	type?: "voice" | "video";
	incoming?: boolean;
}

export interface CallState {
	voiceCall?: Call;
	videoCall?: Call;
}

export const callState = atom<CallState>({
	key: "callState",
	default: {
		voiceCall: undefined,
		videoCall: undefined,
	},
});
