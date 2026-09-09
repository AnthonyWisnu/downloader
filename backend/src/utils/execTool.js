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

module.exports = {
  execTool,
  runYtDlp,
  runFfmpeg,
  runFfprobe
};
