const { execFile } = require("child_process");

function execTool(command, args, options = {}) {
  const maxBuffer = options.maxBuffer || 1024 * 1024 * 16;
  const missingMessage = options.missingMessage || `${command} belum terinstall`;

  return new Promise((resolve, reject) => {
    execFile(command, args, { maxBuffer, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;

        if (error.code === "ENOENT") {
          error.message = missingMessage;
        } else if (stderr && !error.message.includes(stderr)) {
          error.rawStderr = stderr;
        }

        reject(error);
        return;
      }

      resolve(stdout);
    });
  });
}

function runYtDlp(args, options = {}) {
  return execTool("yt-dlp", args, {
    missingMessage: "yt-dlp belum terinstall",
    ...options
  });
}

function runFfmpeg(args, options = {}) {
  return execTool("ffmpeg", args, {
    missingMessage: "ffmpeg belum terinstall",
    ...options
  });
}

function runFfprobe(args, options = {}) {
  return execTool("ffprobe", args, {
    missingMessage: "ffprobe belum terinstall",
    ...options
  });
}

function runGalleryDl(args, options = {}) {
  return execTool("gallery-dl", args, {
    missingMessage: "gallery-dl belum terinstall",
    ...options
  });
}

function parseYtDlpJson(output) {
  const trimmed = String(output || "").trim();

  if (!trimmed) {
    throw new Error("Metadata JSON yt-dlp kosong");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    try {
      return JSON.parse(lines[lines.length - 1]);
    } catch {
      throw new Error("Output JSON yt-dlp tidak dapat dibaca");
    }
  }
}

module.exports = {
  execTool,
  runYtDlp,
  runFfmpeg,
  runFfprobe,
  runGalleryDl,
  parseYtDlpJson
};
