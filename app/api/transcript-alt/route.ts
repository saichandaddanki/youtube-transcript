import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { parse } from "node-html-parser"

// Function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number.parseInt(dec, 10)))
}

// This is a completely different approach that uses YouTube's hidden transcript API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    console.log(`Processing alternative transcript request for video ID: ${videoId}`)

    // Step 1: Get video details using YouTube API
    let videoTitle = "YouTube Video"
    let channelTitle = ""

    try {
      const videoDetailsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`,
        { timeout: 5000 },
      )

      if (videoDetailsResponse.data.items && videoDetailsResponse.data.items.length > 0) {
        videoTitle = videoDetailsResponse.data.items[0].snippet.title
        channelTitle = videoDetailsResponse.data.items[0].snippet.channelTitle
      }
    } catch (error) {
      console.log("Failed to get video details from API, continuing with extraction")
    }

    // Step 2: Get available caption tracks
    let captionTracks = []

    try {
      // First, get the video page to find available caption tracks
      const videoPageResponse = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      })

      // Try to find the list of available languages
      const langListMatch = videoPageResponse.data.match(/"translationLanguages":\[(.*?)\]/s)

      if (langListMatch) {
        try {
          const langListJson = JSON.parse(`[${langListMatch[1]}]`)
          captionTracks = langListJson.map((lang: any) => ({
            languageCode: lang.languageCode,
            name: lang.languageName?.simpleText || lang.languageCode,
          }))

          console.log(`Found ${captionTracks.length} language options`)
        } catch (e) {
          console.log("Failed to parse language list")
        }
      }
    } catch (error) {
      console.log("Failed to get caption tracks, continuing with default English")
    }

    // If no tracks were found, add English as a default option
    if (captionTracks.length === 0) {
      captionTracks.push({ languageCode: "en", name: "English" })
    }

    // Step 3: Try to get transcript using YouTube's hidden transcript API
    // This approach works for many videos, including those with auto-generated captions
    let transcript = []
    let successfulLanguage = null

    // Try each language until we find one that works
    for (const track of captionTracks) {
      try {
        console.log(`Trying to get transcript in ${track.name} (${track.languageCode})`)

        // First try with auto-generated captions
        const autoUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&asr=1&lang=${track.languageCode}`
        const autoResponse = await axios.get(autoUrl, { timeout: 3000 })

        if (autoResponse.data && autoResponse.data.length > 10) {
          // Parse the XML
          const root = parse(autoResponse.data)
          const textElements = root.querySelectorAll("text")

          if (textElements && textElements.length > 0) {
            console.log(`Found ${textElements.length} auto-generated caption entries in ${track.languageCode}`)

            transcript = textElements.map((element) => {
              const start = Number.parseFloat(element.getAttribute("start") || "0")
              const duration = Number.parseFloat(element.getAttribute("dur") || "0")
              const text = decodeHtmlEntities(element.text)

              return {
                text,
                offset: Math.round(start * 1000), // Convert to milliseconds
                duration: Math.round(duration * 1000),
              }
            })

            successfulLanguage = track
            break
          }
        }

        // Then try with manual captions
        const manualUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${track.languageCode}`
        const manualResponse = await axios.get(manualUrl, { timeout: 3000 })

        if (manualResponse.data && manualResponse.data.length > 10) {
          // Parse the XML
          const root = parse(manualResponse.data)
          const textElements = root.querySelectorAll("text")

          if (textElements && textElements.length > 0) {
            console.log(`Found ${textElements.length} manual caption entries in ${track.languageCode}`)

            transcript = textElements.map((element) => {
              const start = Number.parseFloat(element.getAttribute("start") || "0")
              const duration = Number.parseFloat(element.getAttribute("dur") || "0")
              const text = decodeHtmlEntities(element.text)

              return {
                text,
                offset: Math.round(start * 1000), // Convert to milliseconds
                duration: Math.round(duration * 1000),
              }
            })

            successfulLanguage = track
            break
          }
        }
      } catch (error) {
        console.log(`Failed to get transcript in ${track.languageCode}:`, error.message)
      }
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        {
          error:
            "No captions available for this video. The video may not have captions, or they may be disabled by the content owner.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      transcript,
      videoTitle,
      channelTitle,
      language: successfulLanguage,
      availableLanguages: captionTracks,
    })
  } catch (error: any) {
    console.error("Error processing transcript request:", error)

    return NextResponse.json(
      {
        error: "Failed to extract transcript. Please try again or try a different video.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
