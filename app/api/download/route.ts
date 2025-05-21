import { type NextRequest, NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"

// Interface for transcript entries
interface TranscriptEntry {
  text: string
  offset: number
  duration: number
}

// Convert seconds to HH:MM:SS format
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// Convert seconds to HH:MM:SS,MS format for SRT
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
}

// Format transcript as plain text
function formatAsText(transcript: TranscriptEntry[]): string {
  return transcript
    .map((entry) => {
      const timeInSeconds = entry.offset / 1000
      return `${formatTime(timeInSeconds)}\n${entry.text}\n`
    })
    .join("\n")
}

// Format transcript as SRT
function formatAsSrt(transcript: TranscriptEntry[]): string {
  return transcript
    .map((entry, index) => {
      const startTime = entry.offset / 1000
      const endTime = startTime + entry.duration / 1000

      return `${index + 1}\n${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n${entry.text}\n`
    })
    .join("\n")
}

// Format transcript as VTT
function formatAsVtt(transcript: TranscriptEntry[]): string {
  let vtt = "WEBVTT\n\n"

  vtt += transcript
    .map((entry) => {
      const startTime = entry.offset / 1000
      const endTime = startTime + entry.duration / 1000

      return `${formatTime(startTime)}.${Math.floor((startTime % 1) * 1000)
        .toString()
        .padStart(3, "0")} --> ${formatTime(endTime)}.${Math.floor((endTime % 1) * 1000)
        .toString()
        .padStart(3, "0")}\n${entry.text}`
    })
    .join("\n\n")

  return vtt
}

// Format transcript as CSV
function formatAsCsv(transcript: TranscriptEntry[]): string {
  let csv = "start,end,text\n"

  csv += transcript
    .map((entry) => {
      const startTime = Math.floor(entry.offset / 1000)
      const endTime = Math.floor((entry.offset + entry.duration) / 1000)
      // Escape quotes in the text
      const escapedText = entry.text.replace(/"/g, '""')

      return `${startTime},${endTime},"${escapedText}"`
    })
    .join("\n")

  return csv
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")
    const format = searchParams.get("format") || "txt"

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // Fetch video details to get the title for the filename
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    let videoTitle = "youtube-transcript"

    if (videoDetailsResponse.ok) {
      const videoDetails = await videoDetailsResponse.json()
      videoTitle = videoDetails.items?.[0]?.snippet?.title || "youtube-transcript"
      // Sanitize filename
      videoTitle = videoTitle
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()
    }

    // Fetch transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId)

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "No transcript available for this video" }, { status: 404 })
    }

    let content = ""
    let filename = `${videoTitle}.txt`

    // Format based on requested format
    switch (format.toLowerCase()) {
      case "txt":
        content = formatAsText(transcript)
        filename = `${videoTitle}.txt`
        break
      case "srt":
        content = formatAsSrt(transcript)
        filename = `${videoTitle}.srt`
        break
      case "vtt":
        content = formatAsVtt(transcript)
        filename = `${videoTitle}.vtt`
        break
      case "csv":
        content = formatAsCsv(transcript)
        filename = `${videoTitle}.csv`
        break
      default:
        content = formatAsText(transcript)
        filename = `${videoTitle}.txt`
    }

    return NextResponse.json({
      success: true,
      content,
      filename,
    })
  } catch (error: any) {
    console.error("Error generating transcript download:", error)

    // Handle specific errors from the library
    if (error.message?.includes("Could not get transcripts")) {
      return NextResponse.json({ error: "No captions available for this video" }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to generate transcript download. Please try again." }, { status: 500 })
  }
}
