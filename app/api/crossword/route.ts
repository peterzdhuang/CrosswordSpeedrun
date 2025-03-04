import { NextResponse } from "next/server"
import { sampleCrosswordData } from "@/lib/crossword-data"

export async function GET() {
  // In a real application, you would load this from a database or file
  // For this example, we're using the sample data from our lib
  return NextResponse.json(sampleCrosswordData)
}

