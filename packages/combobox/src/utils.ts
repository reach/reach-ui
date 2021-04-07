// Forked from https://github.com/bvaughn/highlight-words-core

/**
 * Creates an array of chunk objects representing both higlightable and non
 * highlightable pieces of text that match each search word.
 *
 * @return Array of "chunk" objects
 */
function findAll({
  autoEscape,
  caseSensitive = false,
  findChunks = defaultFindChunks,
  sanitize,
  searchWords,
  textToHighlight,
}: {
  autoEscape?: boolean;
  caseSensitive?: boolean;
  findChunks?: typeof defaultFindChunks;
  sanitize?: typeof defaultSanitize;
  searchWords: string[];
  textToHighlight?: string | null;
}): Chunk[] {
  return fillInChunks({
    chunksToHighlight: combineChunks({
      chunks: findChunks({
        autoEscape,
        caseSensitive,
        sanitize,
        searchWords,
        textToHighlight,
      }),
    }),
    totalLength: textToHighlight ? textToHighlight.length : 0,
  });
}

/**
 * Takes an array of "chunk" objects and combines chunks that overlap into
 * single chunks.
 *
 * @return Array of "chunk" objects
 */
function combineChunks({ chunks }: { chunks: Chunk[] }): Chunk[] {
  return chunks
    .sort((first, second) => first.start - second.start)
    .reduce<Chunk[]>((processedChunks, nextChunk) => {
      // First chunk just goes straight in the array...
      if (processedChunks.length === 0) {
        return [nextChunk];
      } else {
        // ... subsequent chunks get checked to see if they overlap...
        const prevChunk = processedChunks.pop()!;
        if (nextChunk.start <= prevChunk.end) {
          // It may be the case that prevChunk completely surrounds nextChunk, so take the
          // largest of the end indeces.
          const endIndex = Math.max(prevChunk.end, nextChunk.end);
          processedChunks.push({
            highlight: false,
            start: prevChunk.start,
            end: endIndex,
          });
        } else {
          processedChunks.push(prevChunk, nextChunk);
        }
        return processedChunks;
      }
    }, []);
}

/**
 * Examine text for any matches. If we find matches, add them to the returned
 * array as a "chunk" object.
 *
 * @return Array of "chunk" objects
 */
function defaultFindChunks({
  autoEscape,
  caseSensitive,
  sanitize = defaultSanitize,
  searchWords,
  textToHighlight,
}: {
  autoEscape?: boolean;
  caseSensitive?: boolean;
  sanitize?: typeof defaultSanitize;
  searchWords: string[];
  textToHighlight?: string | null;
}): Chunk[] {
  textToHighlight = sanitize(textToHighlight || "");

  return searchWords
    .filter((searchWord) => searchWord) // Remove empty words
    .reduce<Chunk[]>((chunks, searchWord) => {
      searchWord = sanitize(searchWord);

      if (autoEscape) {
        searchWord = escapeRegExpFn(searchWord);
      }

      const regex = new RegExp(searchWord, caseSensitive ? "g" : "gi");

      let match;
      while ((match = regex.exec(textToHighlight || ""))) {
        let start = match.index;
        let end = regex.lastIndex;
        // We do not return zero-length matches
        if (end > start) {
          chunks.push({ highlight: false, start, end });
        }

        // Prevent browsers like Firefox from getting stuck in an infinite loop
        // See http://www.regexguru.com/2008/04/watch-out-for-zero-length-matches/
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }

      return chunks;
    }, []);
}

/**
 * Given a set of chunks to highlight, create an additional set of chunks
 * to represent the bits of text between the highlighted text.
 *
 * @return Array of "chunk" objects
 */
function fillInChunks({
  chunksToHighlight,
  totalLength,
}: {
  chunksToHighlight: Chunk[];
  totalLength: number;
}): Chunk[] {
  const allChunks: Chunk[] = [];

  if (chunksToHighlight.length === 0) {
    append(0, totalLength, false);
  } else {
    let lastIndex = 0;
    chunksToHighlight.forEach((chunk) => {
      append(lastIndex, chunk.start, false);
      append(chunk.start, chunk.end, true);
      lastIndex = chunk.end;
    });
    append(lastIndex, totalLength, false);
  }
  return allChunks;

  function append(start: number, end: number, highlight: boolean) {
    if (end - start > 0) {
      allChunks.push({
        start,
        end,
        highlight,
      });
    }
  }
}

function defaultSanitize(string: string): string {
  return string;
}

function escapeRegExpFn(string: string): string {
  return string.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

export const HighlightWords = {
  combineChunks,
  fillInChunks,
  findAll,
  findChunks: defaultFindChunks,
};

export interface Chunk {
  highlight: boolean;
  start: number;
  end: number;
}
