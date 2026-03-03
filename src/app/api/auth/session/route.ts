import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getUserById } from "@/lib/storage/userStore";

export const GET = async () => {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    },
    { status: 200 },
  );
};
