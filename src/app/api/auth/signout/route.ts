import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth/session";

export const POST = async () => {
  const response = NextResponse.json(
    { message: "Signed out" },
    { status: 200 },
  );
  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
};
