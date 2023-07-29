"use client";

import "react-toastify/dist/ReactToastify.css";

import { User } from "@prisma/client";
import axios from "axios";
import { EditIcon, LogOutIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import Avatar from "react-avatar";
import { BiDotsVerticalRounded, BiSolidMessageDetail } from "react-icons/bi";
import { BsFillMoonStarsFill, BsSunFill } from "react-icons/bs";
import { MdGroups2 } from "react-icons/md";
import ReactSelect from "react-select";
import { BeatLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";

import getCurrentUser from "@/actions/getCurrentUser";
import { getImageUrl } from "@/actions/getImageUrl";
import getUsers from "@/actions/getUsers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserSession } from "@/lib/model";
import { pusherClient } from "@/lib/pusher";

import { sideBarState } from "../atoms/sideBar";

interface UploadEvent extends React.ChangeEvent<HTMLInputElement> {
	target: HTMLInputElement & EventTarget;
}

interface Selected {
	value: string;
	label: string;
}

export default function ChatListHeader(): React.JSX.Element {
	const router = useRouter();
	const setPageType = useRecoilState(sideBarState)[1];
	const formRef = React.useRef<HTMLFormElement>(null);
	const groupFormRef = React.useRef<HTMLFormElement>(null);
	const [users, setUsers] = React.useState<User[]>([]);
	const [user, setUser] = React.useState<User | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [selected, setSelected] = React.useState<Selected[]>([]);
	const [groupLoading, setGroupLoading] = React.useState<boolean>(false);
	const [groupModalOpen, setGroupModalOpen] = React.useState<boolean>(false);
	const [modalOpen, setModalOpen] = React.useState(false);
	const [groupSelectedFile, setGroupSelectedFile] = React.useState<string | ArrayBuffer | null>(null);
	const [selectedFile, setSelectedFile] = React.useState<string | ArrayBuffer | null>(null);
	const { systemTheme, theme, setTheme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const { data: session } = useSession() as { data: UserSession | undefined };
	const pusherKey = React.useMemo(() => session?.user?.email, [session?.user?.email]);
	const handleGroupSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (groupLoading) return;
		if (!groupFormRef.current) return;
		if (!user) return;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		const groupname = String(groupFormRef.current.groupname.value.trim());
		if (!groupname) {
			toast.error("Please enter a group name");
			return;
		}
		if (selected.length < 2) {
			toast.error("Please select atleast two members");
			return;
		}
		setGroupLoading(true);
		if (groupSelectedFile) {
			void getImageUrl(groupSelectedFile as string)
				.then((url) => {
					if (url) {
						void axios
							.post("api/conversations", {
								logo: url,
								members: [...selected, { value: user.id, label: user.name ?? "" }],
								isGroup: true,
								name: groupname,
							})
							.then(() => {
								toast.success("Group created successfully");
							})
							.catch((err) => {
								toast.error("Something went wrong");
								console.log(err);
							})
							.finally(() => {
								setGroupModalOpen(false);
								setGroupLoading(false);
								setGroupSelectedFile(null);
							});
					}
				})
				.catch((err) => {
					toast.error("File has to be less than 10MB");
					console.log(err);
				});
		} else {
			void axios
				.post("api/conversations", {
					name: groupname,
					members: [...selected, { value: user.id, label: user.name ?? "" }],
					isGroup: true,
				})
				.then(() => {
					toast.success("Group created successfully");
				})
				.catch((err) => {
					toast.error("Something went wrong");
					console.log(err);
				})
				.finally(() => {
					setGroupModalOpen(false);
					setGroupLoading(false);
				});
		}
	};
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (loading) return;
		if (!formRef.current) return;
		setLoading(true);
		const params = {} as { name?: string; about?: string; image?: string };
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		const username = String(formRef.current.username.value.trim());
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		const about = String(formRef.current.about.value.trim());
		if (username) {
			params.name = username;
		}
		if (about) {
			params.about = about;
		}
		if (selectedFile) {
			void getImageUrl(selectedFile as string)
				.then((url) => {
					if (url) {
						params.image = url;
						void axios
							.post("api/settings", params)
							.then(() => {
								toast.success("Profile updated successfully");
							})
							.catch((err) => {
								toast.error("Something went wrong");
								console.log(err);
							})
							.finally(() => {
								setModalOpen(false);
								setLoading(false);
								setSelectedFile(null);
							});
					}
				})
				.catch((err) => {
					toast.error("File has to be less than 10MB");
					console.log(err);
				});
		} else {
			void axios
				.post("api/settings", params)
				.then(() => {
					toast.success("Profile updated successfully");
				})
				.catch((err) => {
					toast.error("Something went wrong");
					console.log(err);
				})
				.finally(() => {
					setModalOpen(false);
					setLoading(false);
				});
		}
	};
	const addImageToPost = (e: UploadEvent): void => {
		const reader = new FileReader();
		if (e.target.files) {
			reader.readAsDataURL(e.target.files[0]);
		}
		reader.onload = (readerEvent): void => {
			if (readerEvent.target) {
				setSelectedFile(readerEvent.target.result);
			}
		};
	};
	const addImagetoGroup = (e: UploadEvent): void => {
		const reader = new FileReader();
		if (e.target.files) {
			reader.readAsDataURL(e.target.files[0]);
		}
		reader.onload = (readerEvent): void => {
			if (readerEvent.target) {
				setGroupSelectedFile(readerEvent.target.result);
			}
		};
	};
	const CloseModal = (): void => {
		if (loading) return;
		setModalOpen(false);
		setSelectedFile(null);
	};
	const CloseGroupModal = (): void => {
		if (groupLoading) return;
		setGroupModalOpen(false);
	};
	React.useEffect(() => {
		void getCurrentUser().then((res) => {
			setUser(res);
		});
	}, []);
	React.useEffect(() => {
		void getUsers().then((res) => {
			setUsers(res);
		});
	}, []);
	React.useEffect(() => {
		if (!pusherKey) return;
		pusherClient.subscribe(pusherKey);
		const updateHandler = (data: User): void => {
			setUser(data);
		};
		pusherClient.bind("user:update", updateHandler);
		return () => {
			pusherClient.unbind("user:update", updateHandler);
			pusherClient.unsubscribe(pusherKey);
		};
	}, [pusherKey]);
	return (
		<>
			<ToastContainer
				position={toast.POSITION.TOP_CENTER}
				autoClose={5000}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme={isDark ? "dark" : "light"}
			/>
			<div className="flex h-16 items-center justify-between bg-[#f0f2f5] px-4 py-3 dark:bg-[#222e35] lg:rounded-tl-lg">
				<div className="flex items-center space-x-4">
					{user?.image ? (
						<Image
							src={user.image || "/user.png"}
							alt="Profile"
							width={40}
							height={40}
							className="h-10 w-10 cursor-pointer rounded-full object-contain"
						/>
					) : (
						<Avatar
							name={user?.name ?? session?.user?.name ?? ""}
							size="40"
							className="h-7 w-7 cursor-pointer rounded-full object-contain p-0"
						/>
					)}
				</div>
				<div className="flex items-center space-x-6 text-[#54656f] dark:text-[#aebac1]">
					<MdGroups2 className="h-6 w-6 cursor-pointer" onClick={(): void => setGroupModalOpen(true)} />
					<BiSolidMessageDetail
						className="h-6 w-6 cursor-pointer"
						onClick={(): void => setPageType("contact")}
					/>
					<DropdownMenu>
						<DropdownMenuTrigger className="border-0 outline-none focus:outline-none">
							<BiDotsVerticalRounded className="h-5 w-5 cursor-pointer" />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="mt-2 w-36 border-[#e9edef] bg-[#f0f2f5] dark:border-[#313d45] dark:bg-[#222e35]">
							<DropdownMenuItem
								onClick={(): void => {
									void signOut().then(() => {
										router.push("/");
									});
								}}
								className="flex w-full cursor-pointer flex-row-reverse items-center justify-between hover:bg-[#b5b5b7] focus:bg-[#b5b5b7] dark:hover:bg-[#374650] dark:focus:bg-[#374650]">
								<LogOutIcon className="h-4 w-4 cursor-pointer" />
								<span className="ml-2">Logout</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(): void => setTheme(isDark ? "light" : "dark")}
								className="flex w-full cursor-pointer flex-row-reverse items-center justify-between hover:bg-[#b5b5b7] focus:bg-[#b5b5b7] dark:hover:bg-[#374650] dark:focus:bg-[#374650]">
								{theme === "dark" ? (
									<BsSunFill className="h-4 w-4 cursor-pointer" />
								) : (
									<BsFillMoonStarsFill className="h-4 w-4 cursor-pointer" />
								)}
								<span className="ml-2">Theme</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(): void => setModalOpen(true)}
								className="flex w-full cursor-pointer flex-row-reverse items-center justify-between hover:bg-[#b5b5b7] focus:bg-[#b5b5b7] dark:hover:bg-[#374650] dark:focus:bg-[#374650]">
								<EditIcon className="h-4 w-4 cursor-pointer" />
								<span className="ml-2">Edit Profile</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<Dialog open={modalOpen}>
					{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
					{/* @ts-expect-error */}
					<DialogContent className="sm:max-w-[425px]" callback={CloseModal} dark={isDark}>
						<DialogHeader>
							<DialogTitle className="my-2 text-center">Edit profile</DialogTitle>
							<DialogDescription className="text-center">
								Make changes to your profile here. Click save when you're done.
							</DialogDescription>
						</DialogHeader>
						<form ref={formRef} className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
							{selectedFile && (
								<div className="flex justify-center">
									<Image
										src={selectedFile as string}
										alt="Profile"
										width={100}
										height={100}
										className="h-[180px] w-[180px] cursor-pointer rounded-full border object-cover"
									/>
								</div>
							)}
							<Input
								disabled={loading}
								id="username"
								placeholder="Name"
								className="col-span-3"
								// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
								onChange={(e): void => formRef.current?.setFieldValue("username", e.target.value)}
							/>
							<Textarea
								disabled={loading}
								id="about"
								placeholder="Enter your bio"
								className="col-span-3"
							/>
							<Input
								disabled={loading}
								id="avatar"
								type="file"
								accept="image/*"
								placeholder="Avatar"
								className="col-span-3"
								onChange={addImageToPost}
							/>
							<Button
								disabled={loading}
								variant={"secondary"}
								className="w-full disabled:cursor-not-allowed disabled:opacity-50"
								type="submit">
								{loading ? <BeatLoader color="#ffffff" size={8} /> : "Save"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
				<Dialog open={groupModalOpen}>
					{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
					{/* @ts-expect-error */}
					<DialogContent className="sm:max-w-[425px]" callback={CloseGroupModal} dark={isDark}>
						<DialogHeader>
							<DialogTitle className="my-2 text-center">Create a group chat</DialogTitle>
							<DialogDescription className="text-center">
								Create a group chat and add your friends to it.
							</DialogDescription>
						</DialogHeader>
						<form ref={groupFormRef} className="flex flex-col gap-4" onSubmit={handleGroupSubmit}>
							{groupSelectedFile && (
								<div className="flex justify-center">
									<Image
										src={groupSelectedFile as string}
										alt="Logo"
										width={100}
										height={100}
										className="h-[180px] w-[180px] cursor-pointer rounded-full border object-cover"
									/>
								</div>
							)}
							<Input
								disabled={groupLoading}
								id="groupname"
								placeholder="Name"
								className="col-span-3"
								// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
								onChange={(e): void => groupFormRef.current?.setFieldValue("groupname", e.target.value)}
							/>
							<ReactSelect
								isDisabled={groupLoading}
								classNamePrefix="my-react-select"
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-expect-error
								options={users.map((user) => ({ value: user.id, label: user.name }))}
								isMulti
								onChange={(selected): void => {
									setSelected(selected as unknown as Selected[]);
								}}
								styles={{
									control: (base) => ({
										...base,
										borderColor: "#e9edef",
										"&:hover": {
											borderColor: "#e9edef",
										},
									}),
								}}
								className="my-react-select-container col-span-3"
								id="members"
								value={selected.map((item) => ({ value: item.value, label: item.label }))}
							/>
							<Input
								disabled={groupLoading}
								id="logo"
								type="file"
								accept="image/*"
								placeholder="Avatar"
								className="col-span-3"
								onChange={addImagetoGroup}
							/>
							<Button
								disabled={groupLoading}
								variant={"secondary"}
								className="w-full disabled:cursor-not-allowed disabled:opacity-50"
								type="submit">
								{groupLoading ? <BeatLoader color="#ffffff" size={8} /> : "Save"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}
