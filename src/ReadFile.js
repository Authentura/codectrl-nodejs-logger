const fs = require("fs");

export function ReadFileLines(filename, line_no) {
  var data = fs.readFileSync(filename, "utf8");
  var lines = data.split("\n");

  if (+line_no > lines.length) {
    return "";
  }
  return lines[+line_no];
}
