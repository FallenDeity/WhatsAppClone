import { type ClassValue, clsx } from "clsx";
import moment from "moment";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

export function formatMessageDate(dateObj: Date): string {
	const now = moment();
	const date = moment(dateObj);
	const today = now.clone().startOf("day");
	const yesterday = now.clone().subtract(1, "days").startOf("day");

	if (date.isSameOrAfter(today)) {
		return date.format("HH:mm A");
	} else if (date.isSameOrAfter(yesterday)) {
		return date.format("[Yesterday]");
	} else {
		return date.format("MMM D, YYYY");
	}
}
