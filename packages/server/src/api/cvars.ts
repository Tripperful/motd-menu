import { Cvar, getEditableCvars, getViewableCvars } from '@motd-menu/common';
import { Router } from 'express';
import { db } from 'src/db';
import { sanitizeCvarValue } from 'src/util';

export const cvarsRouter = Router();

cvarsRouter.post('/get/:cvar?', async (req, res) => {
  try {
    const {
      sessionData: { permissions },
      srcds,
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

    const cvarsValues = await srcds.request('get_cvars_request', cvars);

    res.status(200).json(cvarsValues);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

cvarsRouter.post('/set/:cvar', async (req, res) => {
  try {
    const {
      sessionData: { steamId, permissions },
      srcds,
    } = res.locals;

    const cvar = req.params.cvar as Cvar;
    const value = req.body;
    const editableCvars = getEditableCvars(permissions);

    if (!editableCvars.includes(cvar as Cvar)) return res.status(403).end();

    const sanitizedValue = sanitizeCvarValue(value);

    srcds.send('set_cvar', { cvar, value: sanitizedValue });
    db.logs.add('menu_cvar_change', steamId, { cvar, value: sanitizedValue });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
