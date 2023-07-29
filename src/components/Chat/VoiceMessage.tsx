/* eslint-disable @typescript-eslint/restrict-template-expressions */
"use client";

import { User } from "@prisma/client";
import React from "react";
import { BsCheck2, BsCheck2All } from "react-icons/bs";
import { FaPause, FaPlay } from "react-icons/fa6";
import { useRecoilState } from "recoil";
import WaveSurfer from "wavesurfer.js";

import { FullMessageType } from "@/lib/types";
import { formatMessageDate } from "@/lib/utils";

import { messageSearch } from "../atoms/messageSearch";

export default function VoiceMessage({
	message,
	email,
	users,
}: {
	message: FullMessageType;
	email: string;
	users: User[];
}): React.JSX.Element {
	const MessageSearch = useRecoilState(messageSearch)[0];
	const waveFormRef = React.useRef<HTMLElement | string>("");
	const [waveForm, setWaveForm] = React.useState<WaveSurfer>();
	const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
	const [currentPlaybackTime, setCurrentPlaybackTime] = React.useState<number>(0);
	const [totalDuration, setTotalDuration] = React.useState<number>(0);
	const formatTime = (time: number): string => {
		if (isNaN(time) || time === Infinity) return "00:00";
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};
	const handlePauseRecording = (): void => {
		if (audio) {
			waveForm?.pause();
			setIsPlaying(false);
			audio.pause();
		}
	};
	const handlePlayRecording = (): void => {
		if (audio) {
			setIsPlaying(true);
			void waveForm?.play();
			void audio.play();
		}
	};
	React.useEffect(() => {
		if (audio) {
			const updatePlaybackTime = (): void => {
				setCurrentPlaybackTime(audio.currentTime);
			};
			audio.addEventListener("timeupdate", updatePlaybackTime);
			return () => {
				audio.removeEventListener("timeupdate", updatePlaybackTime);
			};
		}
		return () => null;
	}, [audio]);
	React.useEffect(() => {
		const waveForm = WaveSurfer.create({
			container: waveFormRef.current,
			interact: false,
			waveColor: "#54656f",
			progressColor: "#25d366",
			cursorColor: "#25d366",
			barWidth: 2,
			height: 30,
		});
		waveForm.on("ready", () => {
			setTotalDuration(waveForm.getDuration());
		});
		setWaveForm(waveForm);
		waveForm.on("finish", () => {
			setIsPlaying(false);
			setCurrentPlaybackTime(0);
			waveForm.seekTo(0);
			waveForm.stop();
		});
		return () => {
			waveForm.destroy();
		};
	}, []);
	React.useEffect(() => {
		const url = message.audio;
		const audio = new Audio(String(url));
		setAudio(audio);
		void waveForm?.load(String(url));
	}, [message.audio, waveForm]);
	return (
		<div
			className={`flex items-center justify-center gap-5 rounded-lg px-4 py-2 text-sm text-[#111b21] dark:text-[#daedef] ${
				message.sender.email === email
					? "bg-[#d9fdd3] dark:bg-[#005c4b]"
					: "mx-6 bg-[#ffffff] dark:bg-[#202c33]"
			}`}>
			{isPlaying ? (
				<FaPause className="h-5 w-5 cursor-pointer" onClick={handlePauseRecording} />
			) : (
				<FaPlay className="h-5 w-5 cursor-pointer" onClick={handlePlayRecording} />
			)}
			<div className="relative">
				{/* eslint-disable-next-line  @typescript-eslint/ban-ts-comment */}
				{/* @ts-expect-error */}
				<div className={`mb-1 w-48 lg:w-60 ${MessageSearch && "lg:w-28"}`} ref={waveFormRef} />
				{audio && isPlaying && (
					<span className="text-xs text-[#54656f] dark:text-[#aebac1]">
						{formatTime(currentPlaybackTime)} / {formatTime(totalDuration)}
					</span>
				)}
				{audio && !isPlaying && (
					<span className="text-xs text-[#54656f] dark:text-[#aebac1]">
						{formatTime(currentPlaybackTime)} / {formatTime(totalDuration)}
					</span>
				)}
				<div className="absolute bottom-0 right-0 flex flex-row items-end justify-end gap-1">
					<span className="min-w-fit text-[10px] font-light">{formatMessageDate(message.createdAt)}</span>
					{message.sender.email === email &&
						(message.seenIds.length === users.length ? (
							<BsCheck2All className="h-4 w-4 text-blue-500" />
						) : (
							<BsCheck2 className="h-4 w-4 text-gray-500" />
						))}
				</div>
			</div>
		</div>
	);
}
