import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const { username, password } = await request.json();
    console.log("Signup request received:", { username, password });
    return NextResponse.json(
      { message: "User signed up successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
