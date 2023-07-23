"use client";

import clsx from "clsx";
import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

interface FormDefaults extends FieldValues {
	name: string | undefined;
	email: string;
	password: string;
}

interface InputProps {
	label: string;
	id: string;
	type?: string;
	required?: boolean;
	register: UseFormRegister<FormDefaults>;
	errors: FieldErrors;
	disabled?: boolean;
}

const Input: React.FC<InputProps> = ({ label, id, register, required, errors, type = "text", disabled }) => {
	const [showPassword, setShowPassword] = React.useState<boolean>(false);
	const [_type, setType] = React.useState<string>(type);
	return (
		<div>
			<label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
				{label}
			</label>
			<div className="relative mt-2">
				<input
					id={id}
					type={_type}
					autoComplete={id}
					disabled={disabled}
					{...register(id, { required })}
					className={clsx(
						`form-input form-control block w-full rounded-md border-0 bg-gray-50 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 dark:ring-gray-500 dark:focus:ring-sky-500 sm:text-sm sm:leading-6`,
						errors[id] &&
							"is-invalid ring-rose-500 focus:ring-rose-500 dark:ring-rose-500 dark:focus:ring-rose-500",
						disabled && "cursor-default opacity-50"
					)}
				/>
				{type === "password" && (
					<button
						type="button"
						onClick={(): void =>
							setShowPassword(() => {
								if (_type === "password") {
									setType("text");
									return true;
								} else {
									setType("password");
									return false;
								}
							})
						}
						className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
						{showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
					</button>
				)}
			</div>
			{errors[id] && (
				<p className="invalid-feedback mt-2 text-sm text-rose-600 dark:text-rose-400" id={`${id}-error`}>
					{String(errors[id]?.message)}
				</p>
			)}
		</div>
	);
};

export default Input;
