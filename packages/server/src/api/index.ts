import { Router } from 'express';

import { cvarsApi } from './cvars';
import { mapsApi } from './maps';
import { menuApi } from './menu';
import { playersApi } from './players';
import { teamsApi } from './teams';

export const api = Router();

api.use('/menu', menuApi);
api.use('/maps', mapsApi);
api.use('/players', playersApi);
api.use('/teams', teamsApi);
api.use('/cvars', cvarsApi);
api.use((_, res) => res.status(400).end());
