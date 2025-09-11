"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await authClient.signIn.email({
        email,
        password,
      });
      if (data.error) {
        toast.error(data.error.message);
        return;
      }
      if (data.data) {
        console.log(data.data);
        toast.success("Login successful");
        router.push("/dashboard");
        return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="backdrop-blur-sm bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl text-white max-md:p-6 max-md:rounded-xl">
        <CardHeader className="max-md:pb-4">
          <span className="text-3xl font-bold max-md:text-2xl">
            City Gate Hospital
          </span>
          <CardTitle className="max-md:text-lg">
            Login to your account
          </CardTitle>
          <CardDescription className="text-white max-md:text-sm">
            If you are a new patient, please contact our reception to get access
            to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 max-md:gap-4">
              <div className="grid gap-3 max-md:gap-2">
                <Label htmlFor="email" className="text-white max-md:text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="text-white placeholder:text-white max-md:text-sm max-md:py-2"
                  disabled={loading}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3 max-md:gap-2">
                <div className="flex items-center">
                  <Label
                    htmlFor="password"
                    className="text-white max-md:text-sm"
                  >
                    Password
                  </Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-white max-md:text-xs"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  value={password}
                  placeholder="********"
                  className="text-white placeholder:text-white max-md:text-sm max-md:py-2"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3 max-md:gap-2">
                <Button
                  type="submit"
                  className="w-full text-white max-md:text-sm max-md:py-2"
                  disabled={loading}
                >
                  {loading && <Loader className="animate-spin" />}
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
