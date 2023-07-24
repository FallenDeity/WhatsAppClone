import { atom } from "recoil";

type pages = "default" | "contact" | "settings";

export const sideBarState = atom({
	key: "sideBarState",
	default: "default" as pages,
});
