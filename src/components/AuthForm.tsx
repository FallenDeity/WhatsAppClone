/* eslint-disable @typescript-eslint/no-unsafe-member-access */

"use client";

import "react-toastify/dist/ReactToastify.css";

import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Lottie from "lottie-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { BeatLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import * as Yup from "yup";

import animationData from "@/assets/animation_lkgam3yw.json";
import { UserSession } from "@/lib/model";

import AuthSocialButton from "./Inputs/AuthSocialButton";
import Button from "./Inputs/Button";
import Input from "./Inputs/Input";

enum FormVariants {
	LOGIN = "LOGIN",
	REGISTER = "REGISTER",
}

export default function AuthForm(): React.JSX.Element {
	const router = useRouter();
	const { data: session } = useSession() as { data: UserSession | undefined };
	const { systemTheme, theme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const [variant, setVariant] = React.useState<FormVariants>(FormVariants.LOGIN);
	const [loading, setLoading] = React.useState<boolean>(false);
	const toggleVariant = React.useCallback(() => {
		if (variant === FormVariants.LOGIN) {
			setVariant(FormVariants.REGISTER);
		} else {
			setVariant(FormVariants.LOGIN);
		}
	}, [variant]);
	const schema = Yup.object().shape({
		password: Yup.string()
			.required("Password is required")
			.min(8, "Password must be at least 8 characters")
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/,
				"Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
			),
		email: Yup.string().email("Email is invalid").required("Email is required"),
		name: variant === FormVariants.REGISTER ? Yup.string().required("Name is required") : Yup.string(),
	});
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		resolver: yupResolver(schema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});
	const onSubmit: SubmitHandler<FieldValues> = (data: FieldValues) => {
		if (loading) return;
		setLoading(true);
		if (variant === FormVariants.LOGIN) {
			signIn("credentials", {
				...data,
				redirect: false,
			})
				.then((callback) => {
					if (callback?.error) {
						toast.error("Invalid credentials");
					}
					if (callback?.ok && !callback.error) {
						toast.success("Logged in successfully");
					}
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			void axios
				.post("/api/register", data)
				.then(() => {
					void signIn("credentials", {
						...data,
						redirect: false,
					}).then((callback) => {
						if (callback?.error) {
							toast.error("Invalid credentials");
						}
						if (callback?.ok && !callback.error) {
							toast.success("Registered successfully!");
							router.push("/chat");
						}
					});
				})
				.catch((err) => {
					toast.error(String(err.response.data.error));
				})
				.finally(() => {
					setLoading(false);
				});
		}
	};
	const socialAction = (action: string): void => {
		if (loading) return;
		setLoading(true);
		if (session) {
			void signOut();
		}
		void signIn(action, {
			callbackUrl: "/chat",
		})
			.then((callback) => {
				if (callback?.error) {
					toast.error("Invalid credentials");
				}
				if (callback?.ok && !callback.error) {
					toast.success("Logged in successfully");
				}
			})
			.finally(() => {
				setLoading(false);
			});
	};
	React.useEffect(() => {
		reset();
		setLoading(false);
	}, [variant, reset]);
	React.useEffect(() => {
		if (session) {
			setLoading(true);
			const email = session.user?.email ?? "";
			void axios
				.get("/api/users", {
					params: {
						email,
					},
				})
				.then((res) => {
					if (res.status === 200) {
						if (res.data.emailVerified) {
							router.push("/chat");
						} else {
							router.push("/verify");
						}
					}
				});
			setLoading(false);
		}
	}, [session, router]);
	return (
		<>
			{session ? (
				<Lottie animationData={animationData} loop={true} height={500} width={500} />
			) : (
				<div className="max-w-sm px-2 sm:mx-auto sm:w-full sm:max-w-md">
					<div className="relative rounded-lg bg-white px-6 py-6 shadow-lg dark:bg-gray-900 sm:px-10">
						<Image
							className="absolute left-0 right-0 top-0 mx-auto h-24 w-24 -translate-y-1/2 rounded-full bg-white p-3 dark:bg-gray-900"
							src="/logo.png"
							alt="Logo"
							width={72}
							height={72}
						/>
						<h2 className="my-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
							{variant === FormVariants.LOGIN ? "Sign in" : "Create an account"}
						</h2>
						{/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
						<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
							{variant === FormVariants.REGISTER && (
								<Input
									disabled={loading}
									register={register}
									errors={errors}
									required
									id="name"
									label="Name"
								/>
							)}
							<Input
								disabled={loading}
								register={register}
								errors={errors}
								required
								id="email"
								label="Email address"
								type="email"
							/>
							<Input
								disabled={loading}
								register={register}
								errors={errors}
								required
								id="password"
								label="Password"
								type="password"
							/>
							<div>
								<Button disabled={loading} fullWidth type="submit">
									{loading ? (
										<BeatLoader color="#fff" className="my-auto block" size={8} />
									) : variant === FormVariants.LOGIN ? (
										"Sign in"
									) : (
										"Sign up"
									)}
								</Button>
							</div>
						</form>
						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300 dark:border-gray-700" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
										Or continue with
									</span>
								</div>
							</div>
							<div className="mt-6 flex gap-2">
								<AuthSocialButton
									className="bg-gray-50 text-black hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
									icon={BsGithub}
									onClick={(): void => socialAction("github")}
								/>
								<AuthSocialButton
									className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
									icon={FcGoogle}
									onClick={(): void => socialAction("google")}
								/>
							</div>
						</div>
						<div className="mt-6 flex justify-center gap-2 px-2 text-sm text-gray-500">
							<div>
								{variant === FormVariants.LOGIN ? "New to whatsapp clone?" : "Already have an account?"}
							</div>
							<div onClick={toggleVariant} className="cursor-pointer text-blue-500">
								{variant === FormVariants.LOGIN ? "Create an account" : "Login"}
							</div>
						</div>
					</div>
				</div>
			)}
			<ToastContainer
				position="top-center"
				autoClose={5000}
				closeOnClick
				pauseOnFocusLoss
				theme={isDark ? "dark" : "light"}
			/>
		</>
	);
}
