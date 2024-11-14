const express = require("express");
const axios = require("axios");
const app = express();

async function searchPlayerDataWithPostAPI(query) {
    const searchResultList = [];

    const finalQuery = {
        context: {
            client: {
                hl: "en",
                gl: "IN",
                deviceMake: "",
                deviceModel: "",
                remoteHost: "152.59.165.148",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0,gzip(gfe)",
                clientName: "IOS",
                clientVersion: "19.16.3",
                screenPixelDensity: 1,
                timeZone: "Asia/Kolkata",
                browserName: "Firefox",
                browserVersion: "132.0",
                acceptHeader: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                deviceExperimentId: "ChxOelF6TkRNNU1UTTJPRE01T0RrNE9EZzVNQT09EI-HsbkGGI-HsbkG",
                screenWidthPoints: 1534,
                screenHeightPoints: 334,
                utcOffsetMinutes: 330,
                clientScreen: "WATCH",
                mainAppWebInfo: {
                    pwaInstallabilityStatus: "PWA_INSTALLABILITY_STATUS_UNKNOWN",
                    webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
                    isWebNativeShareAvailable: "false"
                }
            },
            user: {
                lockedSafetyMode: "false"
            },
            request: {
                useSsl: "true",
                internalExperimentFlags: [],
                consistencyTokenJars: []
            },
            clickTracking: {
                clickTrackingParams: "CNQCENwwIhMI1emaz7LJiQMVN-lMAh3IOCkMMgpnLWhpZ2gtcmVjWg9GRXdoYXRfdG9fd2F0Y2iaAQYQjh4YngE="
            }
        },
        videoId: query,
        params: "YAHIAQE%3D",
        playbackContext: {
            contentPlaybackContext: {
                vis: 5,
                splay: "false",
                autoCaptionsDefaultOn: "false",
                autonavState: "STATE_NONE",
                html5Preference: "HTML5_PREF_WANTS",
                signatureTimestamp: 20032,
                autoplay: "true",
                autonav: "true",
                referer: "https://www.youtube.com/",
                lactMilliseconds: "-1",
                watchAmbientModeContext: {
                    hasShownAmbientMode: "true",
                    watchAmbientModeEnabled: "true"
                }
            }
        },
        racyCheckOk: "false",
        contentCheckOk: "false",
       
    };

    try {
        const response = await axios.post(
            'https://youtubei.googleapis.com/youtubei/v1/player',
            finalQuery
        );

        const jsonData = response.data;
        const allFormatsVideo = jsonData.streamingData?.formats || [];
        const allAdaptiveFormatsVideo = jsonData.streamingData?.adaptiveFormats || [];
        const videoDetails = jsonData.videoDetails || {};

        // Collect all formats
        allFormatsVideo.forEach(video => searchResultList.push(video));
        allAdaptiveFormatsVideo.forEach(video => searchResultList.push(video));

        return searchResultList;
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return {searchResultList: []} ;
    }
}
// Function to download file in chunks
async function downloadFileInChunks(url, res, rangeHeader, fileName, fileSize) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    let fromBytes = 0;
    let untilBytes = fileSize - 1;

    if (rangeHeader) {
      const range = rangeHeader.replace(/bytes=/, "").split("-");
      fromBytes = parseInt(range[0], 10);
      untilBytes = range[1] ? parseInt(range[1], 10) : untilBytes;

      res.status(206);
      res.setHeader("Content-Range", `bytes ${fromBytes}-${untilBytes}/${fileSize}`);
    } else {
      res.status(200);
    }

    res.setHeader("Content-Length", fileSize);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Error downloading file");
  }
}

app.get("/", async (req, res) => {
    
    
    res.json("Welcome to yt inner api");
})


app.get("/watch", async (req, res) => {
    const query = req.query.v;
    const streamList = await searchPlayerDataWithPostAPI(query);
    res.json(streamList);
})



app.get("/dlv", async (req, res) => {
  const query = req.query.v;
  const streamList = await searchPlayerDataWithPostAPI(query);
  let videoUrl, fileSize;

  for (const stream of streamList) {
    if (stream.mimeType.includes("video/mp4")) {
      videoUrl = stream.url;
      fileSize = parseInt(stream.contentLength, 10);
      break;
    }
  }

  const rangeHeader = req.headers.range;
  await downloadFileInChunks(videoUrl, res, rangeHeader, `video_${query}.mp4`, fileSize);
});

app.get("/dla", async (req, res) => {
  const query = req.query.v;
  const streamList = await searchPlayerDataWithPostAPI(query);
  let audioUrl, fileSize;

  for (const stream of streamList) {
    if (stream.mimeType.includes("audio/mp4")) {
      audioUrl = stream.url;
      fileSize = parseInt(stream.contentLength, 10);
      break;
    }
  }

  const rangeHeader = req.headers.range;
  await downloadFileInChunks(audioUrl, res, rangeHeader, `audio_${query}.mp4`, fileSize);
});










/*async function getStreamList(query) {
  return [
    {
      mimeType: "video/mp4",
      url: "https://path.to/your/video.mp4",
      contentLength: "12345678",
    },
    {
      mimeType: "audio/mp4",
      url: "https://path.to/your/audio.mp4",
      contentLength: "1234567",
    },
  ];
}*/
const PORT = process.env.PORT || 4000;
//const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
