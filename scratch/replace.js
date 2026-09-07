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
      
      // Replace rose-* with blue-*
      content = content.replace(/rose-(\d+)/g, "blue-$1");
      
      // Replace red-* with blue-* (except maybe we should preserve red if it is a delete button? 
      // Most of the app uses red as primary. Let us just replace all for now, as it is requested to change the interfaces color)
      content = content.replace(/red-(\d+)/g, "blue-$1");
      
      // Also replace %23EF4444 with %233B82F6 (blue-500)
      content = content.replace(/%23EF4444/gi, "%233B82F6");

      fs.writeFileSync(fullPath, content);
    }
  }
};

dirs.forEach(processDir);
console.log("Done");

