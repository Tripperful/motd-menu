import { Severity } from '@motd-menu/common';
import { Router } from 'express';
import { dbgErr, dbgInfo, dbgWarn } from 'src/util';

export const logApi = Router();

const logFuncMap: Record<Severity, (...args: string[]) => void> = {
  info: dbgInfo,
  warn: dbgWarn,
  error: dbgErr,
};

logApi.post('/:severity', async (req, res) => {
  try {
    const { sessionData } = res.locals;

    const { token, name, steamId } = sessionData ?? {};

    const severity = req.params.severity as Severity;
    const log = req.body;

    const logFunc = logFuncMap[severity];

    logFunc?.(
      `@@@ Client ${severity} from player ${name} (token: ${token}, steamid: ${steamId}):`,
      '\n' + log,
    );

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
