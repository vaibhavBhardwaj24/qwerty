"use client";
import { string, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignUpAction } from "@/lib/serverAction/authAction";
import { useRouter, redirect } from "next/navigation";
import { cn } from "@/utils/cn";
import { Label } from "@/components/ui/label";
import Link from "next/link";
export const SignUpSchema = z.object({
  email: z.string().email({ message: "enter valid email" }),
  password: z.string(),
});

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const onSubmit: SubmitHandler<z.infer<typeof SignUpSchema>> = async ({
    email,
    password,
  }) => {
    console.log("trying");

    SignUpAction({ email, password });
    console.log("submitted");
  };
  return (
    // <Form {...form}>
    //   <form onSubmit={form.handleSubmit(onSubmit)}>
    //     <FormField
    //       control={form.control}
    //       name="email"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel>Email</FormLabel>
    //           <FormControl>
    //             <Input
    //               placeholder="Email"
    //               {...field}
    //               value={email}
    //               onChange={(e) => {
    //                 setEmail(e.target.value);
    //               }}
    //             />
    //           </FormControl>
    //           <FormDescription>enter your registered email</FormDescription>
    //         </FormItem>
    //       )}
    //     />
    //     <FormField
    //       control={form.control}
    //       name="password"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel>Password</FormLabel>
    //           <FormControl>
    //             <Input
    //               placeholder="Password"
    //               type="password"
    //               {...field}
    //               value={pass}
    //               onChange={(e) => {
    //                 setPass(e.target.value);
    //               }}
    //             />
    //           </FormControl>
    //           <FormDescription>Enter your password</FormDescription>
    //         </FormItem>
    //       )}
    //     />

    //     <Button
    //       type="submit"
    //       disabled={isLoading}
    //       onClick={() => {
    //         onSubmit({ email: email, password: pass });
    //       }}
    //     >
    //       Submit
    //     </Button>
    //   </form>
    // </Form>
    <div className="bg-dot-white/[0.2] h-[100vh] items-center flex">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black border-[1px] border-white/[0.46]  ">
        <h1 className="text-7xl font-bold bg-clip-text bg-gradient-to-b from-zinc-500 to-gray-800 text-transparent p-6 flex justify-center w-full">
          Sign Up
        </h1>
        <form action="" className="my-8">
          <div className="flex flex-col md:flex-col space-y-2 md:space-y-0 md:space-x-2 mb-4 gap-4 ">
            <div className={cn("flex flex-col space-y-2 w-full")}>
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                placeholder="TylerDurden123"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <div className={cn("flex flex-col space-y-2 w-full")}>
              <Label htmlFor="pass">Password</Label>
              <Input
                id="pass"
                placeholder="******"
                type="text"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                }}
              />
            </div>
            <button
              className="bg-gradient-to-br relative group/btn font-bold text-2xl from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                onSubmit({ email: email, password: pass });
              }}
            >
              Sign Up
              <BottomGradient />
            </button>
          </div>
        </form>
        <p className="w-full flex text-black justify-center">
          ALready have an account?{" "}
          <Link href={"/login"} className="hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};
