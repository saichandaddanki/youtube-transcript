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

// This approach mimics browser behavior more closely
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    console.log(`Processing browser-like transcript request for video ID: ${videoId}`)

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

    // Step 2: Get the video page with browser-like headers
    const browserHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      Referer: "https://www.youtube.com/",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "max-age=0",
    }

    const videoPageResponse = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: browserHeaders,
    })

    const html = videoPageResponse.data
    console.log("Successfully fetched video page HTML with browser-like headers")

    // Step 3: Extract the ytInitialPlayerResponse JSON
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s)
    if (!playerResponseMatch) {
      console.log("Could not find ytInitialPlayerResponse in the page HTML")
      return NextResponse.json({ error: "Failed to extract video data" }, { status: 500 })
    }

    let playerResponse
    try {
      playerResponse = JSON.parse(playerResponseMatch[1])
      console.log("Successfully parsed ytInitialPlayerResponse")
    } catch (e) {
      console.error("Failed to parse ytInitialPlayerResponse:", e)
      return NextResponse.json({ error: "Failed to parse video data" }, { status: 500 })
    }

    // Step 4: Try to find caption data in multiple locations
    let transcript = []
    let captionTracks = []
    let successfulMethod = ""

    // Method 1: Try to get captions from playerCaptionsTracklistRenderer
    const captionsFromPlayer = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (captionsFromPlayer && captionsFromPlayer.length > 0) {
      console.log(`Found ${captionsFromPlayer.length} caption tracks in playerCaptionsTracklistRenderer`)
      captionTracks = captionsFromPlayer.map((track: any) => ({
        languageCode: track.languageCode,
        name: track.name?.simpleText || track.languageCode,
        baseUrl: track.baseUrl,
      }))

      // Try to get the first caption track
      if (captionTracks.length > 0 && captionTracks[0].baseUrl) {
        try {
          const captionResponse = await axios.get(captionTracks[0].baseUrl)
          const captionXml = captionResponse.data
          console.log("Successfully fetched caption XML from playerCaptionsTracklistRenderer")

          // Parse the XML
          const root = parse(captionXml)
          const textElements = root.querySelectorAll("text")

          if (textElements && textElements.length > 0) {
            console.log(`Found ${textElements.length} caption entries from playerCaptionsTracklistRenderer`)

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

            successfulMethod = "playerCaptionsTracklistRenderer"
          }
        } catch (e) {
          console.log("Failed to get captions from playerCaptionsTracklistRenderer:", e.message)
        }
      }
    }

    // Method 2: Try to extract captions from the transcript UI data
    if (transcript.length === 0) {
      console.log("Trying to extract captions from transcript UI data")

      // Look for the transcript data in the HTML
      const transcriptDataMatch = html.match(/window\["ytInitialData"\]\s*=\s*({.+?});/s)

      if (transcriptDataMatch) {
        try {
          const transcriptData = JSON.parse(transcriptDataMatch[1])

          // Navigate through the complex structure to find transcript data
          // This is a simplification - the actual path might be different
          const transcriptRenderer =
            transcriptData?.playerOverlays?.playerOverlayRenderer?.decoratedPlayerBarRenderer
              ?.decoratedPlayerBarRenderer?.playerBar?.multiMarkersPlayerBarRenderer?.markersMap?.[0]?.value?.chapters

          if (transcriptRenderer && transcriptRenderer.length > 0) {
            console.log("Found transcript data in ytInitialData")

            // Extract and format the transcript
            transcript = transcriptRenderer.map((chapter: any) => {
              const timeRangeStartMillis = chapter.chapterRenderer?.timeRangeStartMillis || 0
              const timeRangeEndMillis = chapter.chapterRenderer?.timeRangeEndMillis || 0
              const title = chapter.chapterRenderer?.title?.simpleText || ""

              return {
                text: title,
                offset: timeRangeStartMillis,
                duration: timeRangeEndMillis - timeRangeStartMillis,
              }
            })

            successfulMethod = "ytInitialData"
          }
        } catch (e) {
          console.log("Failed to extract transcript from ytInitialData:", e.message)
        }
      }
    }

    // Method 3: Try to get captions directly from YouTube's transcript API
    if (transcript.length === 0) {
      console.log("Trying YouTube's transcript API directly")

      // Try multiple languages
      const languagesToTry = ["en", "en-US", "en-GB", ""]

      for (const lang of languagesToTry) {
        try {
          // Try auto-generated captions first
          const autoUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&asr=1&lang=${lang}`
          const autoResponse = await axios.get(autoUrl, {
            headers: browserHeaders,
            timeout: 3000,
          })

          if (autoResponse.data && autoResponse.data.length > 10) {
            // Parse the XML
            const root = parse(autoResponse.data)
            const textElements = root.querySelectorAll("text")

            if (textElements && textElements.length > 0) {
              console.log(
                `Found ${textElements.length} auto-generated caption entries in ${lang || "default language"}`,
              )

              transcript = textElements.map((element) => {
                const start = Number.parseFloat(element.getAttribute("start") || "0")
                const duration = Number.parseFloat(element.getAttribute("dur") || "0")
                const text = decodeHtmlEntities(element.text)

                return {
                  text,
                  offset: Math.round(start * 1000),
                  duration: Math.round(duration * 1000),
                }
              })

              successfulMethod = `transcript API (auto, ${lang || "default"})`
              break
            }
          }

          // Then try manual captions
          const manualUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}`
          const manualResponse = await axios.get(manualUrl, {
            headers: browserHeaders,
            timeout: 3000,
          })

          if (manualResponse.data && manualResponse.data.length > 10) {
            // Parse the XML
            const root = parse(manualResponse.data)
            const textElements = root.querySelectorAll("text")

            if (textElements && textElements.length > 0) {
              console.log(`Found ${textElements.length} manual caption entries in ${lang || "default language"}`)

              transcript = textElements.map((element) => {
                const start = Number.parseFloat(element.getAttribute("start") || "0")
                const duration = Number.parseFloat(element.getAttribute("dur") || "0")
                const text = decodeHtmlEntities(element.text)

                return {
                  text,
                  offset: Math.round(start * 1000),
                  duration: Math.round(duration * 1000),
                }
              })

              successfulMethod = `transcript API (manual, ${lang || "default"})`
              break
            }
          }
        } catch (e) {
          console.log(`Failed to get transcript in ${lang || "default language"}:`, e.message)
        }
      }
    }

    // Method 4: Try to extract from the transcript list
    if (transcript.length === 0) {
      console.log("Trying to extract from transcript list")

      try {
        // This URL sometimes contains transcript data
        const transcriptListUrl = `https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`

        const payload = {
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20210721.00.00",
            },
          },
          params: btoa(JSON.stringify({ videoId })),
        }

        const transcriptListResponse = await axios.post(transcriptListUrl, payload, {
          headers: {
            ...browserHeaders,
            "Content-Type": "application/json",
          },
        })

        if (transcriptListResponse.data) {
          console.log("Got response from transcript list API")

          // Extract transcript data from the response
          // This is a simplification - the actual structure might be different
          const transcriptItems =
            transcriptListResponse.data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.body
              ?.transcriptBodyRenderer?.cueGroups

          if (transcriptItems && transcriptItems.length > 0) {
            console.log(`Found ${transcriptItems.length} transcript items in transcript list`)

            transcript = transcriptItems.map((item: any) => {
              const cue = item.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
              const startMs = Number.parseInt(cue.startOffsetMs)
              const durationMs = Number.parseInt(cue.durationMs)
              const text = cue.cue.simpleText

              return {
                text,
                offset: startMs,
                duration: durationMs,
              }
            })

            successfulMethod = "transcript list API"
          }
        }
      } catch (e) {
        console.log("Failed to extract from transcript list:", e.message)
      }
    }

    // Method 5: Try one more approach
    if (transcript.length === 0) {
      console.log("Trying one more approach with innertube API")

      try {
        // This is YouTube's internal API
        const innertubeUrl = `https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`

        const payload = {
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20210721.00.00",
              hl: "en",
              gl: "US",
            },
          },
          videoId,
        }

        const innertubeResponse = await axios.post(innertubeUrl, payload, {
          headers: {
            ...browserHeaders,
            "Content-Type": "application/json",
          },
        })

        if (innertubeResponse.data) {
          console.log("Got response from innertube API")

          // Try to find captions in the response
          const captionTracks = innertubeResponse.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks

          if (captionTracks && captionTracks.length > 0) {
            console.log(`Found ${captionTracks.length} caption tracks in innertube API`)

            // Get the first caption track
            const firstTrack = captionTracks[0]

            if (firstTrack.baseUrl) {
              const captionResponse = await axios.get(firstTrack.baseUrl)
              const captionXml = captionResponse.data

              // Parse the XML
              const root = parse(captionXml)
              const textElements = root.querySelectorAll("text")

              if (textElements && textElements.length > 0) {
                console.log(`Found ${textElements.length} caption entries from innertube API`)

                transcript = textElements.map((element) => {
                  const start = Number.parseFloat(element.getAttribute("start") || "0")
                  const duration = Number.parseFloat(element.getAttribute("dur") || "0")
                  const text = decodeHtmlEntities(element.text)

                  return {
                    text,
                    offset: Math.round(start * 1000),
                    duration: Math.round(duration * 1000),
                  }
                })

                successfulMethod = "innertube API"
              }
            }
          }
        }
      } catch (e) {
        console.log("Failed to extract from innertube API:", e.message)
      }
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        {
          error:
            "No captions available for this video. The video may not have captions, or they may be disabled by the content owner.",
          videoId,
          videoTitle,
          channelTitle,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      transcript,
      videoTitle,
      channelTitle,
      method: successfulMethod,
      videoId,
    })
  } catch (error: any) {
    console.error("Error processing browser-like transcript request:", error)

    return NextResponse.json(
      {
        error: "Failed to extract transcript. Please try again or try a different video.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
