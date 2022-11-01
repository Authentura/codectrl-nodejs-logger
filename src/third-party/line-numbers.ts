// Adapted from: https://github.com/avajs/ava/blob/14061be6be828f13d27e66e7f6942a37fbecc61e/lib/worker/line-numbers.js
//
// Credit to: Mark Wubben <mark@novemberborn.net>, Oskar Löfgren <islander.abroad@gmail.com>
//
// MIT License
//
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be included in all copies
// or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
// CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import Module from "module";

interface Position {
  line: number;
  column: number;
}

interface PositionWithPossibleFilename {
  fileName?: string;
  line: number;
  column: number;
}

export const translate = (
  sourceMap: Module.SourceMap,
  pos: Position
): PositionWithPossibleFilename => {
  if (!sourceMap) {
    return pos;
  }

  const entry = sourceMap.findEntry(pos.line - 1, pos.column); // Source maps are 0-based

  if (!entry) {
    return pos;
  }

  // When used with ts-node/register, we've seen entries without original values. Return the
  // original position.
  if (!entry.originalLine || !entry.originalColumn) {
    return pos;
  }

  return {
    fileName: entry.originalSource,
    line: entry.originalLine + 1, // Readjust for Acorn.
    column: entry.originalColumn,
  };
};
