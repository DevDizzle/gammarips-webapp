const { pathToRegexp } = require("path-to-regexp");
try {
  const keys = [];
  const regexp = pathToRegexp('/:ticker((?!arena|about|terms|auth|api|login|signup|dashboard)[a-zA-Z]{1,5})', keys);
  console.log("Regex:", regexp);
  console.log("Match /arena:", regexp.test('/arena'));
  console.log("Match /tsla:", regexp.test('/tsla'));
} catch (e) {
  console.log("Error:", e.message);
}
