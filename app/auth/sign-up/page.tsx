import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-r from-purple-950 via-purple-800 to-purple-950">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
