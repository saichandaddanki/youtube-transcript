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

// Function to extract captions directly from YouTube
async function extractCaptionsDirectly(videoId: string) {
  try {
    console.log(`Attempting to extract captions directly for video ${videoId}`)

    // Step 1: Get the video page HTML
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const response = await axios.get(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    })

    const html = response.data
    console.log("Successfully fetched video page HTML")

    // Step 2: Extract the ytInitialPlayerResponse JSON
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s)
    if (!playerResponseMatch) {
      console.log("Could not find ytInitialPlayerResponse in the page HTML")
      return null
    }

    let playerResponse
    try {
      playerResponse = JSON.parse(playerResponseMatch[1])
      console.log("Successfully parsed ytInitialPlayerResponse")
    } catch (e) {
      console.error("Failed to parse ytInitialPlayerResponse:", e)
      return null
    }

    // Step 3: Try multiple paths to find caption tracks
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks

    // If not found in the primary location, try alternative locations
    if (!captionTracks || captionTracks.length === 0) {
      console.log("No caption tracks found in primary location, trying alternatives")

      // Try to find auto-generated captions
      const timedTextUrl = playerResponse?.streamingData?.adaptiveFormats?.[0]?.timedTextUrl
      if (timedTextUrl) {
        console.log("Found timedTextUrl:", timedTextUrl)
        // Fetch the timed text directly
        try {
          const timedTextResponse = await axios.get(timedTextUrl)
          const timedTextData = timedTextResponse.data

          // Process the timed text data
          // This would need custom parsing based on the format
          console.log("Successfully fetched timed text data")

          // For now, we'll try a different approach
        } catch (e) {
          console.log("Failed to fetch timed text:", e)
        }
      }

      // Try to find captions in the videoDetails section
      const captionsEnabled = playerResponse?.videoDetails?.isCaptionsAvailable
      if (captionsEnabled) {
        console.log("Video has captions according to videoDetails, but couldn't find them in the expected location")
      }

      // Last resort: Try to get the transcript via the transcript API endpoint
      try {
        console.log("Attempting to fetch transcript via transcript API endpoint")
        const transcriptApiUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`
        const transcriptResponse = await axios.get(transcriptApiUrl)
        const transcriptXml = transcriptResponse.data

        if (transcriptXml && transcriptXml.length > 0) {
          console.log("Found transcript via API endpoint")

          // Parse the XML to extract transcript entries
          const root = parse(transcriptXml)
          const textElements = root.querySelectorAll("text")

          if (textElements && textElements.length > 0) {
            console.log(`Found ${textElements.length} caption entries via API endpoint`)

            // Convert to our transcript format
            const transcript = textElements.map((element) => {
              const start = Number.parseFloat(element.getAttribute("start") || "0")
              const duration = Number.parseFloat(element.getAttribute("dur") || "0")
              const text = decodeHtmlEntities(element.text)

              return {
                text,
                offset: Math.round(start * 1000), // Convert to milliseconds
                duration: Math.round(duration * 1000),
              }
            })

            return transcript
          }
        }
      } catch (e) {
        console.log("Failed to fetch transcript via API endpoint:", e)
      }

      // Try to find auto-generated captions
      try {
        console.log("Attempting to fetch auto-generated captions")
        const autoCaptionsUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&asr=1&lang=en`
        const autoCaptionsResponse = await axios.get(autoCaptionsUrl)
        const autoCaptionsXml = autoCaptionsResponse.data

        if (autoCaptionsXml && autoCaptionsXml.length > 0) {
          console.log("Found auto-generated captions")

          // Parse the XML to extract transcript entries
          const root = parse(autoCaptionsXml)
          const textElements = root.querySelectorAll("text")

          if (textElements && textElements.length > 0) {
            console.log(`Found ${textElements.length} auto-generated caption entries`)

            // Convert to our transcript format
            const transcript = textElements.map((element) => {
              const start = Number.parseFloat(element.getAttribute("start") || "0")
              const duration = Number.parseFloat(element.getAttribute("dur") || "0")
              const text = decodeHtmlEntities(element.text)

              return {
                text,
                offset: Math.round(start * 1000), // Convert to milliseconds
                duration: Math.round(duration * 1000),
              }
            })

            return transcript
          }
        }
      } catch (e) {
        console.log("Failed to fetch auto-generated captions:", e)
      }

      console.log("No caption tracks found in any location")
      return null
    }

    console.log(`Found ${captionTracks.length} caption tracks`)

    // Step 4: Get the first available caption track (usually the default one)
    const firstCaptionTrack = captionTracks[0]
    const captionTrackUrl = firstCaptionTrack.baseUrl

    if (!captionTrackUrl) {
      console.log("No caption track URL found")
      return null
    }

    console.log(`Using caption track URL: ${captionTrackUrl}`)

    // Step 5: Fetch the caption track XML
    const captionResponse = await axios.get(captionTrackUrl)
    const captionXml = captionResponse.data
    console.log("Successfully fetched caption XML")

    // Step 6: Parse the XML to extract transcript entries
    const root = parse(captionXml)
    const textElements = root.querySelectorAll("text")

    if (!textElements || textElements.length === 0) {
      console.log("No text elements found in the caption XML")
      return null
    }

    console.log(`Found ${textElements.length} caption entries`)

    // Step 7: Convert to our transcript format
    const transcript = textElements.map((element) => {
      const start = Number.parseFloat(element.getAttribute("start") || "0")
      const duration = Number.parseFloat(element.getAttribute("dur") || "0")
      const text = decodeHtmlEntities(element.text)

      return {
        text,
        offset: Math.round(start * 1000), // Convert to milliseconds
        duration: Math.round(duration * 1000),
      }
    })

    console.log(`Successfully extracted ${transcript.length} transcript entries`)
    return transcript
  } catch (error) {
    console.error("Error extracting captions directly:", error)
    return null
  }
}

// Function to get video details using YouTube API
async function getVideoDetails(videoId: string) {
  try {
    const videoDetailsResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`,
      { timeout: 5000 }, // 5 second timeout
    )

    if (!videoDetailsResponse.data.items || videoDetailsResponse.data.items.length === 0) {
      return { title: "YouTube Video", error: "Video details not found" }
    }

    return {
      title: videoDetailsResponse.data.items[0].snippet.title,
      channelTitle: videoDetailsResponse.data.items[0].snippet.channelTitle,
      publishedAt: videoDetailsResponse.data.items[0].snippet.publishedAt,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching video details:", error)
    return { title: "YouTube Video", error: "Failed to fetch video details" }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    console.log(`Processing transcript request for video ID: ${videoId}`)

    // Get video details (title, etc.)
    const videoDetails = await getVideoDetails(videoId)
    console.log(`Video title: ${videoDetails.title}`)

    // Extract captions directly from YouTube
    console.log("Attempting direct caption extraction...")
    const transcript = await extractCaptionsDirectly(videoId)

    if (!transcript || transcript.length === 0) {
      console.log("Direct caption extraction failed or returned no results")
      return NextResponse.json(
        {
          error:
            "No captions available for this video. The video may not have captions, or they may be disabled by the content owner.",
        },
        { status: 404 },
      )
    }

    console.log(`Successfully extracted ${transcript.length} caption entries`)

    return NextResponse.json({
      success: true,
      transcript,
      videoTitle: videoDetails.title,
      channelTitle: videoDetails.channelTitle,
      publishedAt: videoDetails.publishedAt,
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
