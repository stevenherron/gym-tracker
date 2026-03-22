import { NextRequest, NextResponse } from "next/server";
import { notion, DATA_SOURCE_ID } from "@/lib/notion";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workout, sets } = body;

    if (!workout || !sets || !Array.isArray(sets)) {
      return NextResponse.json(
        { error: "workout and sets are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Write each set as a separate page, throttled to respect Notion limits
    const results = [];
    for (const s of sets) {
      const properties: Record<string, unknown> = {
        Exercise: {
          title: [{ text: { content: s.exercise } }],
        },
        Date: {
          date: { start: now },
        },
        Workout: {
          select: { name: workout },
        },
        Set: {
          number: s.set,
        },
        "Weight (kg)": {
          number: s.weight,
        },
        Reps: {
          number: s.reps,
        },
      };

      const page = await notion.pages.create({
        parent: { data_source_id: DATA_SOURCE_ID },
        properties: properties as any,
      });
      results.push(page.id);

      // Throttle: max 3 requests/second
      if (sets.indexOf(s) < sets.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }

    return NextResponse.json({ success: true, pages: results });
  } catch (error: any) {
    console.error("Error logging sets:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
