"use client";

import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import { useTheme } from "next-themes";
import React from "react";
import { FaCirclePause, FaMicrophone, FaPause, FaPlay, FaTrash } from "react-icons/fa6";
import { MdSend } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";
import WaveSurfer from "wavesurfer.js";

import { getAudioUrl } from "@/actions/getAudioUrl";

import { messageSearch } from "../atoms/messageSearch";

export default function AudioBar({
	conversationId,
	hide,
}: {
	conversationId: string;
	hide: (arg: boolean) => void;
}): React.JSX.Element {
	const MessageSearch = useRecoilState(messageSearch)[0];
	const { systemTheme, theme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const [loading, setLoading] = React.useState<boolean>(false);
	const [recording, setRecording] = React.useState<boolean>(false);
	const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
	const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);
	const [waveForm, setWaveForm] = React.useState<WaveSurfer>();
	const [duration, setDuration] = React.useState(0);
	const [currentPlaybackTime, setCurrentPlaybackTime] = React.useState(0);
	const [totalDuration, setTotalDuration] = React.useState(0);
	const audioRef = React.useRef<HTMLAudioElement>(null);
	const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
	const waveFormRef = React.useRef<HTMLElement | string>("");
	const [render, setRender] = React.useState<File | null>(null);
	React.useEffect(() => {
		let interval: NodeJS.Timeout;
		if (recording) {
			interval = setInterval(() => {
				setDuration((prev) => {
					setTotalDuration(prev + 1);
					return prev + 1;
				});
			}, 1000);
		}
		return () => {
			clearInterval(interval);
		};
	}, [recording]);
	const handleStartRecording = (): void => {
		if (loading) return;
		setDuration(0);
		setCurrentPlaybackTime(0);
		setTotalDuration(0);
		setRecording(true);
		setAudio(null);
		setIsPlaying(false);
		setRender(null);
		void navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				const mediaRecorder = new MediaRecorder(stream);
				mediaRecorderRef.current = mediaRecorder;
				if (audioRef.current) {
					audioRef.current.srcObject = stream;
				}
				const chunks: Blob[] = [];
				mediaRecorder.addEventListener("dataavailable", (e) => {
					chunks.push(e.data);
				});
				mediaRecorder.addEventListener("stop", () => {
					const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
					const audioURL = window.URL.createObjectURL(blob);
					const audio = new Audio(audioURL);
					setAudio(audio);
					void waveForm?.load(audioURL);
				});
				mediaRecorder.start();
			})
			.catch((err) => {
				console.log(err, "MediaRecorder error");
				toast.error("Error while recording audio");
			});
	};
	const handleStopRecording = (): void => {
		if (mediaRecorderRef.current && recording) {
			mediaRecorderRef.current.stop();
			setRecording(false);
			waveForm?.stop();
			const chunks: Blob[] = [];
			mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
				chunks.push(e.data);
			});
			mediaRecorderRef.current.addEventListener("stop", () => {
				const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
				const audioFile = new File([blob], "audio.ogg", { type: "audio/ogg" });
				setRender(audioFile);
			});
		}
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
	const sendRecording = (): void => {
		if (!render || recording) return;
		setLoading(true);
		const reader = new FileReader();
		reader.readAsDataURL(render);
		reader.onloadend = async (): Promise<void> => {
			const base64data = reader.result;
			if (typeof base64data === "string") {
				const url = await getAudioUrl(base64data);
				void axios
					.post("/api/messages", {
						conversationId,
						audio: url,
					})
					.finally(() => {
						setLoading(false);
						hide(false);
					});
			}
		};
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
		if (waveForm) handleStartRecording();
	}, [waveForm]);
	const formatTime = (time: number): string => {
		if (isNaN(time) || time === Infinity) return "00:00";
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};
	return (
		<div className="flex w-full items-center justify-end text-2xl">
			<ToastContainer
				position="top-center"
				autoClose={5000}
				closeOnClick
				pauseOnFocusLoss
				theme={isDark ? "dark" : "light"}
			/>
			<div className="pt-1 text-[#54656f] dark:text-[#aebac1]">
				<FaTrash className="h-5 w-5 cursor-pointer" onClick={(): void => hide(false)} />
			</div>
			<div className="mx-2 flex h-10 items-center justify-center gap-3 rounded-full bg-[#ffffff] px-4 py-2 text-lg text-[#54656f] drop-shadow-lg dark:bg-[#111b21] dark:text-[#e4e6eb] sm:mx-4">
				{recording ? (
					<div className="flex animate-pulse flex-row text-sm text-red-500">
						<span>Recording {formatTime(duration)}</span>
					</div>
				) : (
					<div className="text-[#54656f] dark:text-[#aebac1]">
						{audio && (
							<>
								{isPlaying ? (
									<FaPause className="h-5 w-5 cursor-pointer" onClick={handlePauseRecording} />
								) : (
									<FaPlay className="h-5 w-5 cursor-pointer" onClick={handlePlayRecording} />
								)}
							</>
						)}
					</div>
				)}
				<div
					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
					className={`w-32 sm:w-48 lg:w-60 ${MessageSearch && "lg:w-28"}`}
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					ref={waveFormRef}
					hidden={recording}
				/>
				{audio && isPlaying && !MessageSearch && (
					<span className="hidden text-xs text-[#54656f] dark:text-[#aebac1] sm:flex">
						{formatTime(currentPlaybackTime)} / {formatTime(totalDuration)}
					</span>
				)}
				{audio && !isPlaying && !recording && !MessageSearch && (
					<span className="hidden text-xs text-[#54656f] dark:text-[#aebac1] sm:flex">
						{formatTime(currentPlaybackTime)} / {formatTime(totalDuration)}
					</span>
				)}
				<audio ref={audioRef} hidden />
			</div>
			<div className="mr-4 flex items-center justify-center">
				{!recording ? (
					<FaMicrophone className="h-5 w-5 cursor-pointer text-red-500" onClick={handleStartRecording} />
				) : (
					<FaCirclePause className="h-5 w-5 cursor-pointer text-red-500" onClick={handleStopRecording} />
				)}
			</div>
			<div className="flex h-5 w-5 cursor-pointer items-center justify-center text-[#54656f] dark:text-[#aebac1]">
				{loading ? (
					<ClipLoader color="#36d7b7" size={18} />
				) : (
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					<MdSend className="h-full w-full" onClick={sendRecording} />
				)}
			</div>
		</div>
	);
}
