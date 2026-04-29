"use client";
import { useState } from "react";
import axios from "axios";
import { signIn, SessionProvider } from "next-auth/react";
import { validateEmail } from "@/lib/validations/validateEmail";
import { Card, CardBody, CardHeader, Input, Button, Checkbox } from "@heroui/react";
import { Orbitron } from "next/font/google";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function SignIn() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    // basic client-side validation
    if (!validateEmail(email).isValid) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    try {
      const res = await axios.post("/api/auth/signin", {
        identifier: email,
        password,
        rememberMe,
      });

      if (res.status >= 200 && res.status < 300) {
        window.location.replace("/profile");
        return;
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Authentication failed";
      setErrorMessage(msg);
    }
  };

  return (
    <SessionProvider>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('message') === 'already_verified' && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-500 font-bold rounded-lg text-center">
               Account is already verified
            </div>
          )}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold text-white mb-2 ${orbitron.className}`}>
              <span className="text-zerogreen">{">"}</span> {t("signin.title")}
            </h1>
            <p className="text-gray-400">{t("signin.subtitle")}</p>
          </div>

          <Card className="bg-[#0a0a0a] border-2 border-zerogreen/30 shadow-xl shadow-zerogreen/10">
            <CardHeader className="flex flex-col gap-1 pt-6 pb-0 px-6">
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-zerogreen animate-pulse">█</span>
                  <span className={`text-zerogreen font-bold ${orbitron.className}`}>
                    {t("signin.authRequired")}
                  </span>
                </div>
                <div className="h-px bg-gradient-to-r from-zerogreen via-zerogreen/50 to-transparent mb-4"></div>
              </div>
            </CardHeader>
            <CardBody className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    label={t("signin.email")}
                    placeholder="hacker@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    classNames={{
                      input: "bg-transparent text-white",
                      inputWrapper:
                        "bg-[#0f0f0f] border border-gray-700 hover:border-zerogreen focus-within:border-zerogreen",
                      label: "text-gray-400",
                    }}
                    startContent={
                      <span className="text-zerogreen text-sm">{">"}</span>
                    }
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    label={t("signin.password")}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    classNames={{
                      input: "bg-transparent text-white",
                      inputWrapper:
                        "bg-[#0f0f0f] border border-gray-700 hover:border-zerogreen focus-within:border-zerogreen",
                      label: "text-gray-400",
                    }}
                    startContent={
                      <span className="text-zerogreen text-sm">{">"}</span>
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    classNames={{ wrapper: "border-zerogreen data-[selected=true]:bg-zerogreen", label: "text-gray-400 text-sm" }}
                  >
                    {t("signin.rememberMe")}
                  </Checkbox>
                  <Link href="/forgot-password" className="text-zerogreen hover:text-zerogreen/80 text-sm transition-colors">
                    {t("signin.forgotPassword")}
                  </Link>
                </div>

                {errorMessage && (
                  <div className="mb-2">
                    <span className="text-lg font-bold text-red-500">
                      {errorMessage}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-zerogreen text-black font-bold text-lg hover:bg-zerogreen/90 transition-all duration-300 mt-6"
                  size="lg"
                >
                  <span className={orbitron.className}>{t("signin.authenticate")}</span>
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0a0a0a] text-gray-500">{t("signin.or")}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() =>
                      signIn("github", { callbackUrl: "/profile" })
                    }
                    className="w-full bg-[#0f0f0f] border border-gray-700 hover:border-gray-500 text-white"
                    variant="bordered"
                    startContent={<span>🔐</span>}
                  >
                    {t("signin.continueWithGithub")}
                  </Button>
                  <Button
                    onClick={() => signIn("google", { callbackUrl: "/profile" })}
                    className="w-full bg-[#0f0f0f] border border-gray-700 hover:border-gray-500 text-white"
                    variant="bordered"
                    startContent={<span>🌐</span>}
                  >
                    {t("signin.continueWithGoogle")}
                  </Button>
                </div>

                <div className="text-center mt-6">
                  <span className="text-gray-400">{t("signin.newToZeroday")} </span>
                  <Link href="/signup" className="text-zerogreen hover:text-zerogreen/80 font-bold transition-colors">
                    {t("signin.createAccount")}
                  </Link>
                </div>
              </form>
            </CardBody>
          </Card>

          <div
            className={`text-center mt-6 text-gray-600 text-xs ${orbitron.className}`}
          >
            <p>[ {t("signin.secureConnection")} ]</p>
            <p className="mt-1 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-zerogreen rounded-full animate-pulse"></span>
              {t("signin.encrypted")}
            </p>
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
