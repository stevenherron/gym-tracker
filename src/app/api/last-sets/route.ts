import { NextRequest, NextResponse } from "next/server";
import { notion, DATA_SOURCE_ID } from "@/lib/notion";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exercise = searchParams.get("exercise");

    if (!exercise) {
      return NextResponse.json(
        { error: "exercise parameter is required" },
        { status: 400 }
      );
    }

    const response = await notion.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      filter: {
        property: "Exercise",
        title: {
          equals: exercise,
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
      page_size: 10,
    });

    if (response.results.length === 0) {
      return NextResponse.json({ exercise, date: null, sets: [] });
    }

    // Get the date of the most recent entry
    const firstPage = response.results[0] as any;
    const latestDate = firstPage.properties.Date?.date?.start?.split("T")[0];

    // Filter entries from that same day
    const sameDaySets = response.results
      .filter((page: any) => {
        const d = page.properties.Date?.date?.start?.split("T")[0];
        return d === latestDate;
      })
      .map((page: any) => ({
        set: page.properties.Set?.number ?? 1,
        weight: page.properties["Weight (kg)"]?.number ?? 0,
        reps: page.properties.Reps?.number ?? 0,
      }))
      .sort((a: any, b: any) => a.set - b.set);

    return NextResponse.json(
      { exercise, date: latestDate, sets: sameDaySets },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching last sets:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
