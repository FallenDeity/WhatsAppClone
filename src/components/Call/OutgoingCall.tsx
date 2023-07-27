"use client";

import { User } from "@prisma/client";
import axios from "axios";
// import Image from "next/image";
import React from "react";
// import Avatar from "react-avatar";
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
	const [zg, setZg] = React.useState<ZegoExpressEngine | null>(null);
	const [streamID, setStreamID] = React.useState("");
	const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = React.useState<MediaStream | null>(null);
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
				zg?.stopPlayingStream(streamID);
				zg?.stopPublishingStream(streamID);
				zg?.logoutRoom(String(call.roomID));
				if (remoteStream) zg?.destroyStream(remoteStream);
				if (localStream) zg?.destroyStream(localStream);
				zg?.destroyEngine();
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
							camera: { audio: true, video: call.type === "video" },
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
	return (
		<div className="z-20 flex h-[100vh] max-h-screen w-full items-center justify-center overflow-hidden border border-[#e9edef] bg-[#efeae2] text-[#54656f] dark:border-[#313d45] dark:bg-[#0b141a] dark:text-[#aebac1] lg:h-[95vh] lg:rounded-lg">
			<div className="flex flex-col items-center justify-center space-y-10">
				<span className="my-3 text-sm text-opacity-30">
					{call.type === "video" ? "Video Call" : "Voice Call"}
				</span>
				{/*
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
					*/}
				<div className="video-wrapper">
					<div id="local-video"></div>
					<div id="local-audio" className="hidden"></div>
					<div id="remote-video"></div>
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
						void axios
							.post("/api/call", {
								id: call.roomID,
								sender: user,
								receiver: call.user,
								type: call.type,
								ended: true,
							})
							.then(() => {
								setCallState({});
								zg?.stopPlayingStream(streamID);
								zg?.stopPublishingStream(streamID);
								zg?.logoutRoom(String(call.roomID));
								if (remoteStream) zg?.destroyStream(remoteStream);
								if (localStream) zg?.destroyStream(localStream);
								zg?.destroyEngine();
							});
					}}
				/>
			</div>
		</div>
	);
}
