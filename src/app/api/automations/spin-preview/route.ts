import { NextResponse } from "next/server";
import { getPreviewVariations } from "@/lib/instagram/reply-spinner";

export async function POST(req: Request) {
  try {
    const { template } = await req.json();
    const variations = getPreviewVariations(template);
    return NextResponse.json({ variations });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate variations" }, { status: 500 });
  }
}
