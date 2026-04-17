import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { formatUsernameNumber, getUserById } from "@/lib/storage/userStore";

export const GET = async () => {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const username =
    typeof user.usernum === "number"
      ? formatUsernameNumber(user.username, user.usernum)
      : user.username;

  return NextResponse.json(
    {
      authenticated: true,
      user: { id: user.id, username, role: user.role ?? "user" },
    },
    { status: 200 },
  );
};
