"use client";

import { User } from "@prisma/client";
import axios from "axios";
import { uniqueId } from "lodash";
import Image from "next/image";
import React from "react";
import Avatar from "react-avatar";
import { MdCallEnd } from "react-icons/md";
import { BeatLoader } from "react-spinners";
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
	const [token, setToken] = React.useState("");
	const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
	const [publishStream, setPublishStream] = React.useState("");
	const [zg, setZg] = React.useState<ZegoExpressEngine | null>(null);
	React.useEffect(() => {
		const task = setInterval(() => {
			void axios.post("/api/call", {
				id: call.roomID,
				sender: user,
				receiver: call.user,
				type: call.type,
				ended: false,
			});
		}, 1000);
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
				setCallAccepted(true);
			} else {
				setCallState({});
				if (localStream && publishStream && zg) {
					zg.destroyStream(localStream);
					zg.stopPublishingStream(publishStream);
					zg.logoutRoom((call.roomID ?? "").toString());
				}
			}
		});
		return () => {
			pusherClient.unsubscribe(String(call.roomID));
			pusherClient.unbind("call:accepted");
		};
	}, []);
	React.useEffect(() => {
		if (callAccepted) {
			setToken(getZegoToken(user.id));
		}
	}, [callAccepted]);
	React.useEffect((): void => {
		if (token) {
			const startCall = (): void => {
				void import("zego-express-engine-webrtc").then(async ({ ZegoExpressEngine }) => {
					const zg = new ZegoExpressEngine(
						parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID ?? ""),
						process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET ?? ""
					);
					setZg(zg);
					zg.on(
						"roomStreamUpdate",
						(roomID: string, updateType: string, streamList: ZegoStreamList[]): void => {
							if (updateType === "ADD") {
								const rmVideo = document.getElementById("remote-video");
								const vid = document.createElement(call.type === "video" ? "video" : "audio");
								vid.setAttribute("id", streamList[0].streamID);
								vid.setAttribute("playsinline", "true");
								vid.setAttribute("autoplay", "true");
								vid.setAttribute("muted", "false");
								vid.setAttribute("className", "rounded-lg");
								rmVideo?.appendChild(vid);
								void zg
									.startPlayingStream(streamList[0].streamID, {
										audio: true,
										video: true,
									})
									.then((stream) => {
										vid.srcObject = stream;
										void vid.play();
									});
								// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
							} else if (updateType === "DELETE" && localStream && streamList[0].streamID) {
								zg.destroyStream(localStream);
								zg.stopPublishingStream(streamList[0].streamID);
								zg.logoutRoom(roomID.toString());
								void axios
									.post("/api/call", {
										id: call.roomID,
										sender: user,
										receiver: call.user,
										type: call.type,
										ended: true,
									})
									.then(() => {
										setCallState({ voiceCall: {}, videoCall: {} });
									});
							}
						}
					);
					await zg.loginRoom(
						(call.roomID ?? "").toString(),
						token,
						{
							userID: user.id.toString(),
							userName: user.name ?? "",
						},
						{ userUpdate: true }
					);
					const localStream = await zg.createStream({
						camera: {
							audio: true,
							video: call.type === "video",
						},
					});
					const localVideo = document.getElementById("local-audio");
					const videoElement = document.createElement(call.type === "video" ? "video" : "audio");
					videoElement.setAttribute("id", "video-local-zego");
					videoElement.classList.add("rounded-lg", "w-32", "h-28");
					videoElement.setAttribute("playsinline", "true");
					videoElement.setAttribute("autoplay", "true");
					videoElement.setAttribute("muted", "false");
					localVideo?.appendChild(videoElement);
					const td = document.getElementById("video-local-zego") as HTMLMediaElement;
					td.srcObject = localStream;
					void td.play();
					const streamID = uniqueId("streamID");
					setPublishStream(streamID);
					setLocalStream(localStream);
					zg.startPublishingStream(streamID, localStream);
				});
			};
			startCall();
		}
	}, [token]);
	return (
		<div className="z-20 flex h-[100vh] max-h-screen w-full items-center justify-center overflow-hidden border border-[#e9edef] bg-[#efeae2] text-[#54656f] dark:border-[#313d45] dark:bg-[#0b141a] dark:text-[#aebac1] lg:h-[95vh] lg:rounded-lg">
			<div className="flex flex-col items-center justify-center space-y-10">
				<span className="my-3 text-sm text-opacity-30">
					{call.type === "video" ? "Video Call" : "Voice Call"}
				</span>
				{!callAccepted &&
					call.type === "video" &&
					(call.user?.image ? (
						<Image
							src={call.user.image}
							alt={call.user.name ?? ""}
							className="rounded-full"
							height={200}
							width={200}
						/>
					) : (
						<Avatar name={call.user?.name ?? ""} className="rounded-full" size="200" textSizeRatio={2} />
					))}
				<div className="relative my-5" id="remote-video">
					<div className="absolute bottom-5 right-5" id="local-audio" />
				</div>
				<span className="mt-5 text-5xl font-semibold">{call.user?.name}</span>
				{callAccepted ? (
					<span className="mt-5 text-xl font-semibold">Ongoing Call</span>
				) : (
					<span className="mt-5 text-xl font-semibold">
						<BeatLoader color="#54656f" />
					</span>
				)}
				<MdCallEnd
					className="mt-5 h-[56px] w-[56px] cursor-pointer rounded-full bg-red-500 p-3 text-white"
					onClick={(): void => {
						if (localStream && publishStream && zg) {
							zg.destroyStream(localStream);
							zg.stopPublishingStream(publishStream);
							zg.logoutRoom((call.roomID ?? "").toString());
						}
						void axios
							.post("/api/call", {
								id: call.roomID,
								sender: user,
								receiver: call.user,
								type: call.type,
								ended: true,
							})
							.then(() => {
								setCallState({ voiceCall: {}, videoCall: {} });
							});
					}}
				/>
			</div>
		</div>
	);
}
