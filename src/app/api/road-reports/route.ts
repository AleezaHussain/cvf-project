import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const IMAGES_BUCKET = process.env.NEXT_PUBLIC_ROAD_IMAGES_BUCKET || "road-images";
const VIDEOS_BUCKET = process.env.NEXT_PUBLIC_ROAD_VIDEOS_BUCKET || "road-videos";

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    const locIdRaw = form.get("loc_id");
    const description = (form.get("description") as string) || null;
    const issuesRaw = (form.get("issues") as string) || "[]";

    const loc_id = locIdRaw ? Number(locIdRaw) : null;
    if (!loc_id || Number.isNaN(loc_id)) {
      return NextResponse.json({ error: "Invalid or missing loc_id" }, { status: 400 });
    }

    let issues: string[] = [];
    try {
      issues = JSON.parse(issuesRaw);
      if (!Array.isArray(issues)) issues = [];
    } catch {
      issues = [];
    }

    let image_url: string | null = null;
    let video_url: string | null = null;

    const imageFile = form.get("image") as File | null;
    const videoFile = form.get("video") as File | null;

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const imgPath = `images/${Date.now()}-${imageFile.name}`;
      const { data: imgUpload, error: imgErr } = await supabase
        .storage
        .from(IMAGES_BUCKET)
        .upload(imgPath, imageFile, { cacheControl: "3600", upsert: false });
      if (imgErr) {
        const msg = imgErr.message || "Image upload failed";
        const hint = `Ensure storage bucket '${IMAGES_BUCKET}' exists and allows uploads.`;
        console.error("Image upload error:", imgErr);
        return NextResponse.json({ error: `${msg}. ${hint}` }, { status: 400 });
      }
      const { data: imgPublic } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(imgUpload.path);
      image_url = imgPublic.publicUrl;
    }

    // Upload video if provided
    if (videoFile && videoFile.size > 0) {
      const vidPath = `videos/${Date.now()}-${videoFile.name}`;
      const { data: vidUpload, error: vidErr } = await supabase
        .storage
        .from(VIDEOS_BUCKET)
        .upload(vidPath, videoFile, { cacheControl: "3600", upsert: false });
      if (vidErr) {
        const msg = vidErr.message || "Video upload failed";
        const hint = `Ensure storage bucket '${VIDEOS_BUCKET}' exists and allows uploads.`;
        console.error("Video upload error:", vidErr);
        return NextResponse.json({ error: `${msg}. ${hint}` }, { status: 400 });
      }
      const { data: vidPublic } = supabase.storage.from(VIDEOS_BUCKET).getPublicUrl(vidUpload.path);
      video_url = vidPublic.publicUrl;
    }

    // Insert into road_reports
    const { data, error } = await supabase
      .from("road_reports")
      .insert({
        loc_id,
        issues,
        description,
        image_url,
        video_url,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    console.error("Unexpected error:", e);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
