import { NextRequest, NextResponse } from "next/server";
import en from "@/../messages/en.json";
import ru from "@/../messages/ru.json";
import hy from "@/../messages/hy.json";

const messages = { en, ru, hy } as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const data = messages[locale as keyof typeof messages];
  if (!data) {
    return NextResponse.json({}, { status: 404 });
  }
  return NextResponse.json(data);
}
