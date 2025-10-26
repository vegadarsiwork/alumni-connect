import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  // In a real application, you would upload the file to a service like S3 or Cloudinary
  // and get a URL back. For now, we'll return a dummy URL.
  const dummyFileUrl = `https://example.com/uploads/${(file as File).name}`;

  return NextResponse.json({ fileUrl: dummyFileUrl }, { status: 200 });
}