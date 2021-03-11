import { Readable } from 'stream';

enum ParsingStages {
  ID_LOOKUP = 1, // ended when newline symbol is found
  HEADERS_HANDLER = 2, // ended when two newlines symbol is found
  BODY_PARSE = 3, // ended when newline symbol is found and id follows next
  END = 4,
}

export type Headers = Record<string, string> ;

interface File {
  id: string;
  headers: Headers;
  body: string;
}

const END_HEADER_SEQ = '\r\n\r\n';

function parseHeadersString(headersString: string): Headers {
  const headers: Headers = {};

  const headersArray = headersString
    .split('\r\n');

  headersArray.forEach((headerData) => {
    const [key, value] = headerData.split(':');

    headers[key] = value.trim();
  });

  return headers;
}
export function multipartParse(stream: Readable): Promise<File> {
  return new Promise((resolve, reject) => {
    let stage = ParsingStages.ID_LOOKUP;

    let id: string = '';
    let headers: string = '';
    let body: string = '';
    let endSeqIndex: number = 0;
    let endBodyIndex: number = 0;

    stream.on('data', (chunk: Buffer) => {
      const stringChunk = chunk.toString();

      for (let i = 0; i < stringChunk.length; i += 1) {
        switch (stage) {
          case ParsingStages.ID_LOOKUP: {
            if (stringChunk[i] === '\n') {
              stage = ParsingStages.HEADERS_HANDLER;
              // eslint-disable-next-line no-continue
              continue;
            }

            id += stringChunk[i];

            break;
          }

          case ParsingStages.HEADERS_HANDLER:
            if (stringChunk[i] === END_HEADER_SEQ[endSeqIndex]) {
              endSeqIndex += 1;
            } else {
              endSeqIndex = 0;
            }

            if (endSeqIndex === 4) {
              stage = ParsingStages.BODY_PARSE;
              headers = headers
                .slice(0, -endSeqIndex + 1);
              // eslint-disable-next-line no-continue
              continue;
            }

            headers += stringChunk[i];
            break;

          case ParsingStages.BODY_PARSE:
            if (stringChunk[i] === id[endBodyIndex]) {
              endBodyIndex += 1;
            } else {
              endBodyIndex = 0;
            }

            if (endBodyIndex === id.length - 1) {
            // TODO: For extending logic for multiple files upload
              stage = ParsingStages.END;
              body = body.slice(0, -endBodyIndex - 1);
              // eslint-disable-next-line no-continue
              return;
            }

            body += stringChunk[i];
            break;
          default:
            reject(new Error('Unknown parsing stage'));
        }
      }
    });

    stream.on('end', () => {
      resolve({
        id,
        headers: parseHeadersString(headers),
        body,
      });
    });

    stream.on('error', reject);
  });
}
