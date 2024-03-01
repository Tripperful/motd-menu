import { Router } from 'express';

import { cvarsRouter } from './cvars';
import { logRouter } from './log';
import { mapsRouter } from './maps';
import { matchRouter } from './match';
import { menuRouter } from './menu';
import { playersRouter } from './players';
import { teamsRouter } from './teams';

export const api = Router();

api.use('/log', logRouter);
api.use('/menu', menuRouter);
api.use('/maps', mapsRouter);
api.use('/players', playersRouter);
api.use('/teams', teamsRouter);
api.use('/cvars', cvarsRouter);
api.use('/match', matchRouter);
api.use((_, res) => res.status(400).end());
