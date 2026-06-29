import { NextRequest, NextResponse } from "next/server";
import { validateImageFile, sniffImageMimeType } from "@/lib/validation/file-validation";
import { getRestorationService } from "@/lib/image-processing/service";
import { RestorationOptions } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Images are processed in-memory for the lifetime of this request only.
 * Nothing is written to disk or a database here.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const optionsRaw = formData.get("options");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file was provided." }, { status: 400 });
    }

    const fileValidation = validateImageFile({
      type: file.type,
      size: file.size,
    });
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sniffed = sniffImageMimeType(buffer);
    if (!sniffed) {
      return NextResponse.json(
        { error: "This file doesn't look like a valid JPG, PNG, or WEBP image." },
        { status: 400 }
      );
    }

    let options: RestorationOptions;
    try {
      options = JSON.parse(typeof optionsRaw === "string" ? optionsRaw : "{}");
    } catch {
      return NextResponse.json({ error: "Invalid restoration options." }, { status: 400 });
    }

    const service = getRestorationService();
    const result = await service.restore({ buffer, mimeType: sniffed }, options);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/restore] processing failed:", err);
    return NextResponse.json(
      { error: "We couldn't process this image. Please try a different file." },
      { status: 500 }
    );
  }
}
