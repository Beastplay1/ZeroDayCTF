"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button, Checkbox } from "@heroui/react";
import { Orbitron } from "next/font/google";
import Link from "next/link";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold text-white mb-2 ${orbitron.className}`}>
            <span className="text-zerogreen">{'>'}</span> Access Terminal
          </h1>
          <p className="text-gray-400">Enter your credentials to continue</p>
        </div>

        <Card className="bg-[#0a0a0a] border-2 border-zerogreen/30 shadow-xl shadow-zerogreen/10">
          <CardHeader className="flex flex-col gap-1 pt-6 pb-0 px-6">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zerogreen animate-pulse">█</span>
                <span className={`text-zerogreen font-bold ${orbitron.className}`}>AUTHENTICATION REQUIRED</span>
              </div>
              <div className="h-px bg-gradient-to-r from-zerogreen via-zerogreen/50 to-transparent mb-4"></div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  label="Email / Username"
                  placeholder="hacker@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  classNames={{
                    input: "bg-transparent text-white",
                    inputWrapper: "bg-[#0f0f0f] border border-gray-700 hover:border-zerogreen focus-within:border-zerogreen",
                    label: "text-gray-400"
                  }}
                  startContent={
                    <span className="text-zerogreen text-sm">{'>'}</span>
                  }
                />
              </div>

              <div>
                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  classNames={{
                    input: "bg-transparent text-white",
                    inputWrapper: "bg-[#0f0f0f] border border-gray-700 hover:border-zerogreen focus-within:border-zerogreen",
                    label: "text-gray-400"
                  }}
                  startContent={
                    <span className="text-zerogreen text-sm">{'>'}</span>
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  classNames={{
                    wrapper: "border-zerogreen data-[selected=true]:bg-zerogreen",
                    label: "text-gray-400 text-sm"
                  }}
                >
                  Remember me
                </Checkbox>
                <Link href="#" className="text-zerogreen hover:text-zerogreen/80 text-sm transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-zerogreen text-black font-bold text-lg hover:bg-zerogreen/90 transition-all duration-300 mt-6"
                size="lg"
              >
                <span className={orbitron.className}>AUTHENTICATE</span>
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#0a0a0a] text-gray-500">OR</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-[#0f0f0f] border border-gray-700 hover:border-gray-500 text-white"
                  variant="bordered"
                  startContent={<span>🔐</span>}
                >
                  Continue with GitHub
                </Button>
                <Button
                  className="w-full bg-[#0f0f0f] border border-gray-700 hover:border-gray-500 text-white"
                  variant="bordered"
                  startContent={<span>🌐</span>}
                >
                  Continue with Google
                </Button>
              </div>

              <div className="text-center mt-6">
                <span className="text-gray-400">New to ZeroDayCTF? </span>
                <Link href="/signup" className="text-zerogreen hover:text-zerogreen/80 font-bold transition-colors">
                  Create account
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className={`text-center mt-6 text-gray-600 text-xs ${orbitron.className}`}>
          <p>[ SECURE CONNECTION ESTABLISHED ]</p>
          <p className="mt-1 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-zerogreen rounded-full animate-pulse"></span>
            ENCRYPTED WITH AES-256
          </p>
        </div>
      </div>
    </div>
  );
}
