const fs = require("fs");
const path = require("path");

const dirs = [
  "c:/Users/esqui/BeautyHub/beautyhub-web/src",
  "c:/Users/esqui/BeautyHub/beautyhub-web-v2/src"
];

const processDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.match(/\.(jsx|tsx|js|ts|css)$/)) {
      let content = fs.readFileSync(fullPath, "utf8");
      
      content = content.replace(/rgba\(239,68,68/g, "rgba(59,130,246");
      content = content.replace(/rgba\(244,\s*63,\s*94/g, "rgba(59, 130, 246");
      content = content.replace(/rgba\(239,\s*68,\s*68/g, "rgba(59, 130, 246");

      fs.writeFileSync(fullPath, content);
    }
  }
};

dirs.forEach(processDir);
console.log("Done rgba");

