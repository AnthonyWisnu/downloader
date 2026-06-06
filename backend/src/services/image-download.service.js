const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pipeline } = require("stream/promises");

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile("ffmpeg", args, { maxBuffer: 1024 * 1024 * 4 }, (error, stdout, stderr) => {
      if (error) {
        const message = error.code === "ENOENT"
          ? "ffmpeg belum terinstall"
          : `ffmpeg gagal convert gambar: ${String(stderr || error.message).slice(0, 300)}`;
        reject(new Error(message));
        return;
      }

      resolve(stdout);
    });
  });
}

function getTempPath(extension) {
  const name = `void-image-${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
  return path.join(os.tmpdir(), name);
}

function cleanup(paths) {
  paths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
    }
  });
}

async function convertWebpStreamToJpeg(readableStream) {
  const inputPath = getTempPath("webp");
  const outputPath = getTempPath("jpg");

  try {
    await pipeline(readableStream, fs.createWriteStream(inputPath));

    await runFfmpeg([
      "-y",
      "-i",
      inputPath,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      outputPath
    ]);

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error("hasil convert gambar kosong");
    }

    return {
      outputPath,
      cleanup() {
        cleanup([inputPath, outputPath]);
      }
    };
  } catch (error) {
    cleanup([inputPath, outputPath]);
    throw error;
  }
}

module.exports = {
  convertWebpStreamToJpeg
};
