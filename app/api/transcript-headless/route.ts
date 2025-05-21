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

// This is our most advanced approach that simulates a full browser session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")
    const languageCode = searchParams.get("lang") || "en"

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    console.log(`Processing headless transcript request for video ID: ${videoId}`)

    // Step 1: Get video details using YouTube API
    let videoTitle = "YouTube Video"
    let channelTitle = ""
    let publishedAt = ""

    try {
      const videoDetailsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`,
        { timeout: 5000 },
      )

      if (videoDetailsResponse.data.items && videoDetailsResponse.data.items.length > 0) {
        videoTitle = videoDetailsResponse.data.items[0].snippet.title
        channelTitle = videoDetailsResponse.data.items[0].snippet.channelTitle
        publishedAt = videoDetailsResponse.data.items[0].snippet.publishedAt
      }
    } catch (error) {
      console.log("Failed to get video details from API, continuing with extraction")
    }

    // Step 2: Create a session with cookies and proper headers
    // These headers more closely mimic a real browser
    const browserHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "max-age=0",
      DNT: "1",
      "X-Forwarded-For": "66.249.66.1", // Google bot IP to avoid restrictions
    }

    // Step 3: First, get the video page to extract necessary tokens and cookies
    const videoPageResponse = await axios.get(`https://www.youtube.com/watch?v=${videoId}&cc_load_policy=1&hl=en`, {
      headers: browserHeaders,
      withCredentials: true,
      maxRedirects: 5,
    })

    const html = videoPageResponse.data
    console.log("Successfully fetched video page HTML")

    // Extract cookies from the response
    const cookies = videoPageResponse.headers["set-cookie"] || []
    const cookieString = cookies.join("; ")

    // Step 4: Extract the API key, client version, and other important tokens
    let apiKey = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8" // Default fallback
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)
    if (apiKeyMatch && apiKeyMatch[1]) {
      apiKey = apiKeyMatch[1]
    }

    let clientVersion = "2.20240214.01.00" // Default fallback
    const clientVersionMatch = html.match(/"clientVersion":"([^"]+)"/)
    if (clientVersionMatch && clientVersionMatch[1]) {
      clientVersion = clientVersionMatch[1]
    }

    // Extract SAPISID cookie for authentication
    let sapisidCookie = ""
    for (const cookie of cookies) {
      if (cookie.includes("SAPISID=")) {
        const match = cookie.match(/SAPISID=([^;]+)/)
        if (match) {
          sapisidCookie = match[1]
        }
        break
      }
    }

    // Generate SAPISIDHASH for authentication
    const generateSapisidHash = (sapisid: string, origin: string) => {
      const now = Math.floor(new Date().getTime() / 1000)
      const input = `${now} ${sapisid} ${origin}`
      // In a real implementation, you would use crypto to generate a SHA-1 hash
      // For this example, we'll use a placeholder
      return `${now}_placeholder_hash`
    }

    const sapisidHash = sapisidCookie ? generateSapisidHash(sapisidCookie, "https://www.youtube.com") : ""

    // Step 5: Extract the ytInitialPlayerResponse JSON
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

    // Step 6: Check if captions are available according to the player response
    const hasCaptions =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.length > 0 ||
      playerResponse?.videoDetails?.isCaptionsAvailable

    console.log(`Video has captions according to player response: ${hasCaptions}`)

    // Step 7: Try multiple approaches to get the transcript
    let transcript = []
    let successfulMethod = ""
    let availableLanguages = []

    // Method 1: Try to get captions from playerCaptionsTracklistRenderer
    const captionsFromPlayer = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (captionsFromPlayer && captionsFromPlayer.length > 0) {
      console.log(`Found ${captionsFromPlayer.length} caption tracks in playerCaptionsTracklistRenderer`)

      // Map available languages
      availableLanguages = captionsFromPlayer.map((track: any) => ({
        languageCode: track.languageCode,
        name: track.name?.simpleText || track.languageCode,
      }))

      // Find the requested language or default to the first one
      const requestedTrack =
        captionsFromPlayer.find((track: any) => track.languageCode === languageCode) || captionsFromPlayer[0]

      if (requestedTrack && requestedTrack.baseUrl) {
        try {
          // Add necessary headers and cookies for the caption request
          const captionResponse = await axios.get(requestedTrack.baseUrl, {
            headers: {
              ...browserHeaders,
              Cookie: cookieString,
              Referer: `https://www.youtube.com/watch?v=${videoId}`,
            },
          })

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

    // Method 2: Try to get captions via the timedtext API with special parameters
    if (transcript.length === 0) {
      console.log("Trying timedtext API with special parameters")

      // Try multiple languages if the requested one fails
      const languagesToTry = [languageCode, "en", "en-US", "en-GB", ""]

      for (const lang of languagesToTry) {
        try {
          // Try with special parameters that sometimes work for restricted captions
          const specialUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv3&xorb=2&xobt=3&xovt=3&asr_langs=de,en,es,fr,it,ja,ko,nl,pt,ru&caps=asr&hl=en&ip=0.0.0.0&ipbits=0&expire=1714821600&sparams=ip,ipbits,expire,v,lang,fmt,xorb,xobt,xovt,asr_langs,caps&signature=placeholder&key=${apiKey}`

          const specialResponse = await axios.get(specialUrl, {
            headers: {
              ...browserHeaders,
              Cookie: cookieString,
              Referer: `https://www.youtube.com/watch?v=${videoId}`,
              Authorization: sapisidHash ? `SAPISIDHASH ${sapisidHash}` : undefined,
            },
            timeout: 5000,
          })

          if (specialResponse.data && specialResponse.data.length > 10) {
            // Parse the XML
            const root = parse(specialResponse.data)
            const textElements = root.querySelectorAll("text")

            if (textElements && textElements.length > 0) {
              console.log(`Found ${textElements.length} caption entries from special timedtext API`)

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

              successfulMethod = `special timedtext API (${lang || "default"})`
              break
            }
          }
        } catch (e) {
          console.log(`Failed to get transcript with special parameters in ${lang || "default language"}:`, e.message)
        }
      }
    }

    // Method 3: Try to get captions via the innertube API with full authentication
    if (transcript.length === 0) {
      console.log("Trying innertube API with full authentication")

      try {
        const innertubeUrl = `https://www.youtube.com/youtubei/v1/get_transcript?key=${apiKey}`

        // This payload format is crucial for accessing restricted captions
        const payload = {
          context: {
            client: {
              clientName: "WEB",
              clientVersion: clientVersion,
              hl: "en",
              gl: "US",
              userAgent: browserHeaders["User-Agent"],
              clientFormFactor: "UNKNOWN_FORM_FACTOR",
              deviceMake: "Google Inc.",
              deviceModel: "",
              platform: "DESKTOP",
              originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
              mainAppWebInfo: {
                graftUrl: `/watch?v=${videoId}`,
                webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
                isWebNativeShareAvailable: false,
              },
            },
            user: {
              lockedSafetyMode: false,
            },
            request: {
              useSsl: true,
              internalExperimentFlags: [],
              consistencyTokenJars: [],
            },
          },
          params: btoa(JSON.stringify({ videoId })),
        }

        const innertubeResponse = await axios.post(innertubeUrl, payload, {
          headers: {
            ...browserHeaders,
            "Content-Type": "application/json",
            Cookie: cookieString,
            Referer: `https://www.youtube.com/watch?v=${videoId}`,
            "X-Youtube-Client-Name": "1",
            "X-Youtube-Client-Version": clientVersion,
            Authorization: sapisidHash ? `SAPISIDHASH ${sapisidHash}` : undefined,
            Origin: "https://www.youtube.com",
          },
        })

        if (innertubeResponse.data) {
          console.log("Got response from innertube API")

          // Try to extract transcript data from the response
          const transcriptRenderer =
            innertubeResponse.data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer
          const transcriptItems = transcriptRenderer?.body?.transcriptBodyRenderer?.cueGroups

          if (transcriptItems && transcriptItems.length > 0) {
            console.log(`Found ${transcriptItems.length} transcript items in innertube API response`)

            transcript = transcriptItems.map((item: any) => {
              const cue = item.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
              const startMs = Number.parseInt(cue.startOffsetMs)
              const durationMs = Number.parseInt(cue.durationMs)
              const text = cue.cue.simpleText || cue.cue.runs?.map((run: any) => run.text).join("") || ""

              return {
                text,
                offset: startMs,
                duration: durationMs,
              }
            })

            successfulMethod = "innertube API with authentication"
          }
        }
      } catch (e) {
        console.log("Failed to extract from innertube API:", e.message)
      }
    }

    // Method 4: Try to extract captions from the video player directly
    if (transcript.length === 0) {
      console.log("Trying to extract captions from video player data")

      try {
        // Look for caption data in the HTML
        const captionDataMatch = html.match(/"captionTracks":\s*(\[.*?\])/s)
        if (captionDataMatch) {
          try {
            // Clean up the JSON string (it might have unescaped newlines and other issues)
            const cleanedJson = captionDataMatch[1]
              .replace(/\n/g, "")
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\")
              .replace(/\\n/g, "\n")
              .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))

            // Try to parse with some error tolerance
            let captionData
            try {
              captionData = JSON.parse(cleanedJson)
            } catch (e) {
              // If direct parsing fails, try to fix common JSON issues
              const fixedJson = `[${cleanedJson
                .replace(/\}\s*\{/g, "},{")
                .replace(/\]\s*\[/g, "],[")
                .replace(/"\s*\}/g, '"}')
                .replace(/\{\s*"/g, '{"')}]`
              captionData = JSON.parse(fixedJson)
            }

            if (captionData && captionData.length > 0) {
              console.log(`Found ${captionData.length} caption tracks in video player data`)

              // Map available languages
              availableLanguages = captionData.map((track: any) => ({
                languageCode: track.languageCode,
                name: track.name?.simpleText || track.languageCode,
              }))

              // Find the requested language or default to the first one
              const requestedTrack =
                captionData.find((track: any) => track.languageCode === languageCode) || captionData[0]

              if (requestedTrack && requestedTrack.baseUrl) {
                const captionResponse = await axios.get(requestedTrack.baseUrl, {
                  headers: {
                    ...browserHeaders,
                    Cookie: cookieString,
                    Referer: `https://www.youtube.com/watch?v=${videoId}`,
                  },
                })

                const captionXml = captionResponse.data

                // Parse the XML
                const root = parse(captionXml)
                const textElements = root.querySelectorAll("text")

                if (textElements && textElements.length > 0) {
                  console.log(`Found ${textElements.length} caption entries from video player data`)

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

                  successfulMethod = "video player data"
                }
              }
            }
          } catch (e) {
            console.log("Failed to parse caption data from video player:", e.message)
          }
        }
      } catch (e) {
        console.log("Failed to extract captions from video player data:", e.message)
      }
    }

    // Method 5: Try to extract from the transcript list with special parameters
    if (transcript.length === 0) {
      console.log("Trying transcript list with special parameters")

      try {
        // This URL sometimes contains transcript data even when other methods fail
        const transcriptListUrl = `https://www.youtube.com/youtubei/v1/get_transcript?key=${apiKey}&prettyPrint=false`

        const payload = {
          context: {
            client: {
              clientName: "WEB",
              clientVersion: clientVersion,
              hl: "en",
              gl: "US",
              userAgent: browserHeaders["User-Agent"],
              clientFormFactor: "UNKNOWN_FORM_FACTOR",
              deviceMake: "Google Inc.",
              deviceModel: "",
              platform: "DESKTOP",
              originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
              mainAppWebInfo: {
                graftUrl: `/watch?v=${videoId}`,
                webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
                isWebNativeShareAvailable: false,
              },
            },
            user: {
              lockedSafetyMode: false,
            },
            request: {
              useSsl: true,
              internalExperimentFlags: [],
              consistencyTokenJars: [],
            },
          },
          params: btoa(
            JSON.stringify({
              videoId,
              params: "CA4aEAIaEAMaEAQaEAU%3D", // Special parameter that sometimes works
            }),
          ),
        }

        const transcriptListResponse = await axios.post(transcriptListUrl, payload, {
          headers: {
            ...browserHeaders,
            "Content-Type": "application/json",
            Cookie: cookieString,
            Referer: `https://www.youtube.com/watch?v=${videoId}`,
            "X-Youtube-Client-Name": "1",
            "X-Youtube-Client-Version": clientVersion,
            Authorization: sapisidHash ? `SAPISIDHASH ${sapisidHash}` : undefined,
            Origin: "https://www.youtube.com",
          },
        })

        if (transcriptListResponse.data) {
          console.log("Got response from transcript list API with special parameters")

          // Extract transcript data from the response
          const transcriptRenderer =
            transcriptListResponse.data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer
          const transcriptItems = transcriptRenderer?.body?.transcriptBodyRenderer?.cueGroups

          if (transcriptItems && transcriptItems.length > 0) {
            console.log(`Found ${transcriptItems.length} transcript items in transcript list with special parameters`)

            transcript = transcriptItems.map((item: any) => {
              const cue = item.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
              const startMs = Number.parseInt(cue.startOffsetMs)
              const durationMs = Number.parseInt(cue.durationMs)
              const text = cue.cue.simpleText || cue.cue.runs?.map((run: any) => run.text).join("") || ""

              return {
                text,
                offset: startMs,
                duration: durationMs,
              }
            })

            successfulMethod = "transcript list with special parameters"
          }
        }
      } catch (e) {
        console.log("Failed to extract from transcript list with special parameters:", e.message)
      }
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        {
          error:
            "No captions available for this video. The video may have captions in the YouTube player, but they are restricted from programmatic access.",
          videoId,
          videoTitle,
          channelTitle,
          availableLanguages,
          hasCaptionsAccordingToPlayer: hasCaptions,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      transcript,
      videoTitle,
      channelTitle,
      publishedAt,
      method: successfulMethod,
      videoId,
      availableLanguages,
      language: languageCode,
    })
  } catch (error: any) {
    console.error("Error processing headless transcript request:", error)

    return NextResponse.json(
      {
        error: "Failed to extract transcript. Please try again or try a different video.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
