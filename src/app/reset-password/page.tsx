"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
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
              New Password
            </h1>
            <p className="text-gray-400">
              Please enter your new password below.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zerogreen/20 flex items-center justify-center text-zerogreen text-4xl mx-auto">
                ✓
              </div>
              <p className="text-zerogreen font-bold">Password reset successful!</p>
              <p className="text-gray-400">Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                label="New Password"
                placeholder="Enter new password"
                variant="bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                className="text-white"
                disabled={!!error && error.includes("token")}
              />
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm new password"
                variant="bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isRequired
                className="text-white"
                disabled={!!error && error.includes("token")}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-zerogreen text-black font-bold h-12"
                isLoading={loading}
                disabled={!!error && error.includes("token")}
              >
                Reset Password
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
