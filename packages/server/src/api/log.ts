import { Severity } from '@motd-menu/common';
import { Router } from 'express';
import { dbgErr, dbgInfo, dbgWarn } from 'src/util';

export const logRouter = Router();

const logFuncMap: Record<Severity, (...args: string[]) => void> = {
  info: dbgInfo,
  warn: dbgWarn,
  error: dbgErr,
};

logRouter.post('/:severity', async (req, res) => {
  try {
    const { sessionData } = res.locals;

    const { token, steamId } = sessionData ?? {};

    const severity = req.params.severity as Severity;
    const log = req.body;

    const logFunc = logFuncMap[severity];

    logFunc?.(
      `@@@ Client ${severity} from player (token: ${token}, steamid: ${steamId}):`,
      '\n' + log,
    );

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
