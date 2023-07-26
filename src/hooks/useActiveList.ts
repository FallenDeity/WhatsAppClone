"use client";

import { create } from "zustand";

interface ActiveListStore {
	members: string[];
	add: (id: string) => void;
	remove: (id: string) => void;
	set: (ids: string[]) => void;
}

const useActiveList = create<ActiveListStore>((set) => ({
	members: [],
	add: (id): void => set((state) => ({ members: [...state.members, id] })),
	remove: (id): void => set((state) => ({ members: state.members.filter((memberId) => memberId !== id) })),
	set: (ids): void => set({ members: ids }),
}));

export default useActiveList;
