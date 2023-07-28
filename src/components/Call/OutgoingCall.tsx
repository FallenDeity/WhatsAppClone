"use client";

import { User } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import React from "react";
import Avatar from "react-avatar";
import { MdCallEnd } from "react-icons/md";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoStreamList } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";

import { pusherClient } from "@/lib/pusher";
import getZegoToken from "@/lib/token";

import { Call, callState } from "../atoms/CallState";

interface Props {
	accepted: boolean;
	reciever: User;
	id: number;
}

export default function OutgoingCall({ call, user }: { call: Call; user: User }): React.JSX.Element {
	const setCallState = useRecoilState(callState)[1];
	const [callAccepted, setCallAccepted] = React.useState(false);
	const [zg, setZg] = React.useState<ZegoExpressEngine | null>(null);
	const [streamID, setStreamID] = React.useState("");
	const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = React.useState<MediaStream | null>(null);
	const [duration, setDuration] = React.useState(0);
	const [endingLoading, setEndingLoading] = React.useState(false);
	React.useEffect(() => {
		void axios.post("/api/call", {
			id: call.roomID,
			sender: user,
			receiver: call.user,
			type: call.type,
			ended: false,
		});
		const task = setInterval(() => {
			void axios.post("/api/call", {
				id: call.roomID,
				sender: user,
				receiver: call.user,
				type: call.type,
				ended: false,
			});
		}, 5000);
		return () => {
			clearInterval(task);
			void axios.post("/api/call", {
				id: call.roomID,
				sender: user,
				receiver: call.user,
				type: call.type,
				ended: true,
			});
		};
	}, []);
	React.useEffect(() => {
		pusherClient.subscribe(String(call.roomID));
		pusherClient.bind("call:accepted", (data: Props) => {
			if (data.accepted) {
				toast.success("Call started!");
				setCallAccepted(true);
			} else {
				toast.error("Call ended!");
				zg?.stopPlayingStream(streamID);
				zg?.stopPublishingStream(streamID);
				if (remoteStream) zg?.destroyStream(remoteStream);
				if (localStream) zg?.destroyStream(localStream);
				zg?.logoutRoom(String(call.roomID));
				zg?.destroyEngine();
				setCallAccepted(false);
				setEndingLoading(false);
				setCallState({});
			}
		});
		return () => {
			pusherClient.unsubscribe(String(call.roomID));
			pusherClient.unbind("call:accepted");
		};
	}, []);
	React.useEffect((): void => {
		if (callAccepted) {
			const _zg = new ZegoExpressEngine(
				parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID ?? ""),
				process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET ?? ""
			);
			_zg.setDebugVerbose(false);
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			void _zg.on("roomStreamUpdate", async (roomID, updateType, streamList: ZegoStreamList[]): Promise<void> => {
				console.log("roomUserUpdate roomID ", roomID, streamList);
				if (updateType === "ADD") {
					const streamID = streamList[0].streamID;
					const remoteStream = await _zg.startPlayingStream(streamID);
					const remoteView = _zg.createRemoteStreamView(remoteStream);
					setRemoteStream(remoteStream);
					remoteView.play("remote-video", { enableAutoplayDialog: true });
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				} else if (updateType === "DELETE") {
					_zg.stopPlayingStream(streamList[0].streamID);
				}
			});
			const token = getZegoToken(user.id);
			setZg(_zg);
			void _zg
				.loginRoom(
					String(call.roomID),
					token,
					{ userID: user.id, userName: user.name ?? "" },
					{ userUpdate: true }
				)
				.then(async (result) => {
					if (result) {
						const localStream = await _zg.createStream({
							camera: {
								audio: true,
								video: call.type === "video",
								videoQuality: 3,
								ANS: true,
								AGC: true,
								AEC: true,
							},
						});
						const localView = _zg.createLocalStreamView(localStream);
						localView.play(call.type === "video" ? "local-video" : "local-audio", {
							enableAutoplayDialog: true,
						});
						const streamID = new Date().getTime().toString();
						setLocalStream(localStream);
						setStreamID(streamID);
						_zg.startPublishingStream(streamID, localStream);
					}
				});
		}
	}, [callAccepted]);
	React.useEffect(() => {
		if (callAccepted) {
			const interval = setInterval(() => {
				setDuration((duration) => duration + 1);
			}, 1000);
			return () => clearInterval(interval);
		}
		return;
	}, [callAccepted]);
	const formatTime = (time: number): string => {
		if (isNaN(time) || time === Infinity) return "00:00";
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};
	return (
		<>
			{callAccepted && call.type === "video" ? (
				<div className="z-20 flex h-[100vh] max-h-screen w-full items-center justify-center overflow-hidden border border-[#e9edef] bg-[#efeae2] text-[#54656f] dark:border-[#313d45] dark:bg-[#0b141a] dark:text-[#aebac1] lg:h-[95vh] lg:rounded-lg">
					<div className="relative h-full w-full rounded-lg bg-black text-white" id="remote-video">
						<span className="absolute left-5 top-5 z-50 flex items-center justify-center text-xl font-extrabold">
							{call.user?.name}
						</span>
						<div className="absolute right-5 top-5 z-50 flex flex-row items-center justify-center space-x-3">
							<div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
							<span className="text-md">{formatTime(duration)}</span>
						</div>
						<div
							className="absolute bottom-5 right-5 z-50 h-auto w-32 shadow-xl sm:w-48 lg:w-56"
							id="local-video"
						/>
						<div className="hidden" id="local-audio" />
						<button
							className="absolute bottom-5 left-0 right-0 z-50 mx-auto flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full bg-red-500 p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
							onClick={(): void => {
								if (endingLoading) return;
								setEndingLoading(true);
								void axios
									.post("/api/call/accepted", {
										id: call.roomID,
										receiver: call.user,
										accepted: false,
									})
									.then(() => {
										zg?.stopPlayingStream(streamID);
										zg?.stopPublishingStream(streamID);
										if (remoteStream) zg?.destroyStream(remoteStream);
										if (localStream) zg?.destroyStream(localStream);
										zg?.logoutRoom(String(call.roomID));
										zg?.destroyEngine();
										setCallAccepted(false);
										setEndingLoading(false);
										setCallState({});
										// audio?.pause();
										// setAudio(null);
									});
							}}
							disabled={endingLoading}>
							<MdCallEnd className="h-6 w-6" />
						</button>
					</div>
				</div>
			) : (
				<div className="z-20 flex h-[100vh] max-h-screen w-full items-center justify-center overflow-hidden border border-[#e9edef] bg-[#efeae2] text-[#54656f] dark:border-[#313d45] dark:bg-[#0b141a] dark:text-[#aebac1] lg:h-[95vh] lg:rounded-lg">
					<div className="flex h-full w-full flex-col items-center justify-center space-y-10">
						{!callAccepted && (
							<span className="my-3 text-sm text-opacity-30">
								{call.type === "video" ? "Video Call" : "Voice Call"}
							</span>
						)}
						<div className={`${callAccepted && call.type === "video" ? "hidden" : ""}`}>
							{(!callAccepted || call.type === "voice") &&
								(call.user?.image ? (
									<Image
										src={call.user.image}
										alt={call.user.name ?? ""}
										className="rounded-full"
										height={200}
										width={200}
									/>
								) : (
									<Avatar
										name={call.user?.name ?? ""}
										className="rounded-full"
										size="200"
										textSizeRatio={2}
									/>
								))}
						</div>
						<span className="mt-5 text-5xl font-semibold">{call.user?.name}</span>
						{callAccepted ? (
							<div className="flex flex-row items-center justify-center space-x-3">
								<div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
								<span className="text-md">{formatTime(duration)}</span>
							</div>
						) : (
							<span className="mt-5 text-xl font-semibold">
								<BeatLoader color="#54656f" />
							</span>
						)}
						<div
							className={`relative rounded-lg ${callAccepted && call.type === "video" ? "" : "hidden"}`}
							id="remote-video">
							<div className="absolute bottom-5 right-5 z-50 h-auto w-56 shadow-xl" id="local-video" />
							<div className="hidden" id="local-audio" />
						</div>
						<button
							className="mt-5 flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full bg-red-500 p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
							onClick={(): void => {
								if (endingLoading) return;
								setEndingLoading(true);
								void axios
									.post("/api/call/accepted", {
										id: call.roomID,
										receiver: call.user,
										accepted: false,
									})
									.then(() => {
										zg?.stopPlayingStream(streamID);
										zg?.stopPublishingStream(streamID);
										if (remoteStream) zg?.destroyStream(remoteStream);
										if (localStream) zg?.destroyStream(localStream);
										zg?.logoutRoom(String(call.roomID));
										zg?.destroyEngine();
										setCallAccepted(false);
										setEndingLoading(false);
										setCallState({});
										// audio?.pause();
										// setAudio(null);
									});
							}}
							disabled={endingLoading}>
							<MdCallEnd className="h-6 w-6" />
						</button>
					</div>
				</div>
			)}
		</>
	);
}
