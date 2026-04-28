"use client";

import { useState } from "react";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { Orbitron } from "next/font/google";
import Link from "next/link";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-[#0a0a0a] border border-zerogreen/30">
        <CardBody className="py-12 px-8 space-y-6">
          <div className="text-center">
            <h1 className={`text-3xl font-bold text-white mb-2 ${orbitron.className}`}>
              Reset Password
            </h1>
            <p className="text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              variant="bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              className="text-white"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-zerogreen text-sm">{message}</p>}

            <Button
              type="submit"
              className="w-full bg-zerogreen text-black font-bold h-12"
              isLoading={loading}
            >
              Send Reset Link
            </Button>
          </form>

          <div className="text-center">
            <Link href="/signin" className="text-zerogreen hover:underline text-sm">
              Back to Sign In
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
