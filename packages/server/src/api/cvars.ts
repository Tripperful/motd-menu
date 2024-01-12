import { Cvar, getEditableCvars, getViewableCvars } from '@motd-menu/common';
import { Router } from 'express';
import { sanitizeCvarValue } from 'src/util';

export const cvarsApi = Router();

cvarsApi.post('/get/:cvar?', async (req, res) => {
  try {
    const {
      sessionData: { permissions },
      srcdsApi,
    } = res.locals;

    const cvars = [] as Cvar[];
    const cvar = req.params.cvar as Cvar;
    const viewableCvars = getViewableCvars(permissions);

    if (cvar) {
      cvars.push(cvar);
    } else if (req.body) {
      cvars.push(...req.body);
    } else {
      cvars.push(...viewableCvars);
    }

    for (const cvar of cvars) {
      if (!viewableCvars.includes(cvar)) {
        return res.status(403).end();
      }
    }

    const cvarsValues = await srcdsApi.getCvars(...cvars);

    res.status(200).end(JSON.stringify(cvarsValues));
  } catch {
    res.status(500).end();
  }
});

cvarsApi.post('/set/:cvar', async (req, res) => {
  try {
    const {
      sessionData: { permissions },
      srcdsApi,
    } = res.locals;

    const cvar = req.params.cvar as Cvar;
    const value = req.body;
    const editableCvars = getEditableCvars(permissions);

    if (!editableCvars.includes(cvar as Cvar)) return res.status(403).end();

    const sanitizedValue = sanitizeCvarValue(value);

    await srcdsApi.setCvar(cvar, sanitizedValue);

    res.status(200).end();
  } catch {
    res.status(500).end();
  }
});
