import * as http from 'http';
import correctText from '../utils/correct-text';
import { multipartParse, Headers } from '../utils/multipart-parse';
import httpConfig from '../config/http';

function getFilename(headers: Headers): string {
  if (headers['Content-Disposition']) {
    const contentData = headers['Content-Disposition'];
    const matched = contentData.match(/filename="([\w.-]+)"/) || [];

    if (matched.length > 1) {
      const [, filename] = matched;

      return filename;
    }
  }

  return 'corrected.txt';
}

const HTTPServer = http.createServer(async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  const {
    body,
    headers,
  } = await multipartParse(req);

  const filename = getFilename(headers);

  const correctedText = correctText(body);

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.write(correctedText);

  res.end();
});

HTTPServer.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

export default function start() {
  HTTPServer.listen({ host: 'localhost', port: httpConfig.PORT }, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on ${httpConfig.PORT} port`);
  });
}
