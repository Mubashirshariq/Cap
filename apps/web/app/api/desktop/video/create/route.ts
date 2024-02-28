import { NextResponse, type NextRequest } from "next/server";
import { db } from "@cap/database";
import { videos } from "@cap/database/schema";
import { getCurrentUser } from "@cap/database/auth/session";
import { nanoId } from "@cap/database/helpers";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const awsRegion = process.env.CAP_AWS_REGION;
  const awsBucket = process.env.CAP_AWS_BUCKET;

  if (!user) {
    return new Response(JSON.stringify({ error: true }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const id = nanoId();

  await db.insert(videos).values({
    id: id,
    ownerId: user.userId,
    awsRegion: awsRegion,
    awsBucket: awsBucket,
  });

  return new NextResponse(
    JSON.stringify({
      id: id,
      user_id: user.userId,
      aws_region: awsRegion,
      aws_bucket: awsBucket,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );
}
