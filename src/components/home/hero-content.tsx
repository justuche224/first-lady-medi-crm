"use client";

import { LoginForm } from "./login-form";

  export default function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-md shadow-2xl w-full max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:max-w-none max-sm:mx-auto">
      <LoginForm />
    </main>
  );
}
