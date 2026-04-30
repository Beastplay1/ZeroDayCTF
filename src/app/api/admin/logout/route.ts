import { NextResponse } from "next/server";
import { getAdminSessionCookieName } from "@/lib/auth/adminSession";

export const POST = async () => {
  const response = NextResponse.json(
    { message: "Signed out" },
    { status: 200 },
  );

  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && process.env.REQUIRE_HTTPS === "true",
    path: "/",
    expires: new Date(0),
  });

  return response;
};
