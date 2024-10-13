import { Vec3, ChargerUseData } from '@motd-menu/common';
import { db } from 'src/db';

export interface ChargeAggregate {
  id: string;
  steamId: string;
  entityId: string;
  origin: Vec3;
  chargerType: string;
  startTick: number;
  startTime: number;
  endTick: number;
  endTime: number;
  startHp: number;
  startAp: number;
  endHp: number;
  endAp: number;
  consumedHp: number;
  consumedAp: number;
  purgeTimeout: NodeJS.Timeout;
}

const chargeAggregates = new Map<string, ChargeAggregate>();

export const chargerUseHandler = async (data: ChargerUseData) => {
  const key = `${data.steamId}:${data.entityId}`;

  let aggregate = chargeAggregates.get(key);

  if (aggregate) {
    const aggregate = chargeAggregates.get(key);

    clearTimeout(aggregate.purgeTimeout);

    aggregate.endTick = data.tick;
    aggregate.endTime = data.curtime;
    aggregate.endHp = data.hpAfter;
    aggregate.endAp = data.armorAfter;
    aggregate.consumedHp += data.hpAfter - data.hpBefore;
    aggregate.consumedAp += data.armorAfter - data.armorBefore;
  } else {
    aggregate = {
      id: data.id,
      origin: data.origin,
      steamId: data.steamId,
      entityId: data.entityId,
      chargerType: data.charger,
      startTick: data.tick,
      startTime: data.curtime,
      endTick: data.tick,
      endTime: data.curtime,
      startHp: data.hpBefore,
      startAp: data.armorBefore,
      endHp: data.hpAfter,
      endAp: data.armorAfter,
      consumedHp: data.hpAfter - data.hpBefore,
      consumedAp: data.armorAfter - data.armorBefore,
      purgeTimeout: null,
    };

    chargeAggregates.set(key, aggregate);
  }

  aggregate.purgeTimeout = setTimeout(() => {
    delete aggregate.purgeTimeout;
    chargeAggregates.delete(key);

    db.matchStats.chargerUse(aggregate);
  }, 1000);
};
