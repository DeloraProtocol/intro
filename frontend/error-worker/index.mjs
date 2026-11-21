import errorHtml from '../website-redesign/404.html';
import { handle } from './handler.mjs';

export default {
  fetch(request, env, ctx) {
    // On unexpected worker exceptions, ask the runtime to pass the request to the origin.
    ctx.passThroughOnException();
    return handle(request, (req) => fetch(req), errorHtml);
  },
};
