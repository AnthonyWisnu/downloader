const fs = require("fs");
const os = require("os");
const path = require("path");
const { pipeline } = require("stream/promises");
const { runFfmpeg } = require("../utils/execTool");

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
