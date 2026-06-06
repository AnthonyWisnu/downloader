const { execFile } = require("child_process");

function runTool(command, args, missingMessage) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { maxBuffer: 1024 * 1024 * 8 }, (error, stdout, stderr) => {
      if (error) {
        const message = error.code === "ENOENT"
          ? missingMessage
          : `${command} gagal: ${String(stderr || error.message).slice(0, 500)}`;
        reject(new Error(message));
        return;
      }

      resolve(stdout);
    });
  });
}

function getVideoStream(metadata) {
  return (metadata.streams || []).find((stream) => stream.codec_type === "video") || null;
}

function getAudioStream(metadata) {
  return (metadata.streams || []).find((stream) => stream.codec_type === "audio") || null;
}

async function getVideoMetadata(inputPath) {
  const output = await runTool("ffprobe", [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_streams",
    "-show_format",
    inputPath
  ], "ffprobe belum terinstall");

  let parsed;

  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error("ffprobe gagal membaca metadata video");
  }

  const video = getVideoStream(parsed);
  const audio = getAudioStream(parsed);

  if (!video) {
    throw new Error("metadata video tidak memiliki stream video");
  }

  return {
    format_name: parsed.format?.format_name || "",
    video: {
      codec_name: video.codec_name || "",
      pix_fmt: video.pix_fmt || "",
      width: Number(video.width || 0),
      height: Number(video.height || 0)
    },
    audio: audio
      ? {
          codec_name: audio.codec_name || ""
        }
      : null
  };
}

function isIosSafeVideo(metadata) {
  const formatName = String(metadata?.format_name || "").toLowerCase();
  const video = metadata?.video || {};
  const audio = metadata?.audio || null;

  return (
    /mp4|mov|m4v/.test(formatName) &&
    String(video.codec_name || "").toLowerCase() === "h264" &&
    String(video.pix_fmt || "").toLowerCase() === "yuv420p" &&
    Number(video.width || 0) % 2 === 0 &&
    Number(video.height || 0) % 2 === 0 &&
    (!audio || String(audio.codec_name || "").toLowerCase() === "aac")
  );
}

async function remuxFaststart(inputPath, outputPath) {
  await runTool("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    outputPath
  ], "ffmpeg belum terinstall");
}

async function transcodeIosSafe(inputPath, outputPath) {
  await runTool("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-profile:v",
    "baseline",
    "-level",
    "3.1",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    outputPath
  ], "ffmpeg belum terinstall");
}

async function normalizeVideoForAllDevices(inputPath, outputPath) {
  const metadata = await getVideoMetadata(inputPath);

  if (isIosSafeVideo(metadata)) {
    try {
      await remuxFaststart(inputPath, outputPath);
      return {
        outputPath,
        mode: "remux",
        metadata
      };
    } catch {
      await transcodeIosSafe(inputPath, outputPath);
      return {
        outputPath,
        mode: "transcode",
        metadata
      };
    }
  }

  await transcodeIosSafe(inputPath, outputPath);

  return {
    outputPath,
    mode: "transcode",
    metadata
  };
}

module.exports = {
  getVideoMetadata,
  isIosSafeVideo,
  normalizeVideoForAllDevices,
  remuxFaststart,
  transcodeIosSafe
};
