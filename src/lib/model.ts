import { Session } from "next-auth";

export interface UserSession extends Session {
	user?: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
		is_verified?: boolean;
	};
}
