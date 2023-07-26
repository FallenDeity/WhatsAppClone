"use client";

import { User } from "@prisma/client";
import { format } from "date-fns";
import React from "react";
import { BsCheck2, BsCheck2All } from "react-icons/bs";
import { FaPause, FaPlay } from "react-icons/fa6";
import WaveSurfer from "wavesurfer.js";

import { FullMessageType } from "@/lib/types";

export default function VoiceMessage({
	message,
	email,
	users,
}: {
	message: FullMessageType;
	email: string;
	users: User[];
}): React.JSX.Element {
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
			className={`flex items-center gap-5 rounded-lg px-4 py-3 text-sm text-[#111b21] dark:text-[#daedef] ${
				message.sender.email === email ? "bg-[#d9fdd3] dark:bg-[#005c4b]" : "bg-[#ffffff] dark:bg-[#202c33]"
			}`}>
			{isPlaying ? (
				<FaPause className="h-5 w-5 cursor-pointer" onClick={handlePauseRecording} />
			) : (
				<FaPlay className="h-5 w-5 cursor-pointer" onClick={handlePlayRecording} />
			)}
			<div className="relative">
				{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
				{/* @ts-expect-error */}
				<div className="w-60" ref={waveFormRef} />
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
				<div className="absolute bottom-0 right-0 flex flex-row items-end gap-1">
					<span className="min-w-fit pt-2 text-[10px] font-light">
						{format(new Date(message.createdAt), "hh:mm aa")}
					</span>
					{message.sender.email === email &&
						(message.seenIds.length === users.length ? (
							<BsCheck2All className="text-blue-500" />
						) : (
							<BsCheck2 className="text-gray-500" />
						))}
				</div>
			</div>
		</div>
	);
}
