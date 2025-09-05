"use client";

import { LoginForm } from "./login-form";

  export default function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-md shadow-2xl w-full">
      <LoginForm />
    </main>
  );
}
