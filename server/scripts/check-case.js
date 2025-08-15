// import fs from "fs";
// import path from "path";
const fs =  require("fs");
const path = require("path");
function checkCase(filePath) {
  const actualName = path.basename(filePath);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) return false;

  const matched = fs.readdirSync(dir).includes(actualName);
  return matched;
}

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      scanDir(fullPath);
    } else if (file.name.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const regex = /require\(['"](.+?)['"]\)|import .* from ['"](.+?)['"]/g;
      let match;
      while ((match = regex.exec(content))) {
        const relPath = match[1] || match[2];
        if (relPath.startsWith(".")) {
          const absPath = path.resolve(dir, relPath);
          const jsPath = absPath + ".js";
          const indexPath = path.join(absPath, "index.js");

          if (fs.existsSync(jsPath) && !checkCase(jsPath)) {
            console.error(`❌ Case mismatch: ${relPath} in ${fullPath}`);
            process.exit(1);
          }
          if (fs.existsSync(indexPath) && !checkCase(indexPath)) {
            console.error(`❌ Case mismatch: ${relPath} in ${fullPath}`);
            process.exit(1);
          }
        }
      }
    }
  }
}

scanDir(path.resolve("./server")); // Scan your backend folder
console.log("✅ No case issues found.");
