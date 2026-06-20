import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPreviewVariations } from "@/lib/instagram/reply-spinner";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { template } = await req.json();
    const variations = getPreviewVariations(template);
    return NextResponse.json({ variations });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate variations" }, { status: 500 });
  }
}
