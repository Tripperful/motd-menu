import { HitSoundPathsData } from '@motd-menu/common';
import { srcdsAssets } from './gameAssets';

export const assetPathToSrcdsSoundPath = (path: string) => {
  if (path == null) return null;
  return path.substring('/game/sound/'.length);
};

export const srcdsSoundPathToAssetPath = (path: string) => {
  if (path == null) return null;
  return `/game/sound/${path}`;
};

export const hitSounds = {
  sf_body: assetPathToSrcdsSoundPath(srcdsAssets.sounds.sfBodyHitSound),
  sf_head: assetPathToSrcdsSoundPath(srcdsAssets.sounds.sfHeadHitSound),
  sf_kill: assetPathToSrcdsSoundPath(srcdsAssets.sounds.sfBodyKillSound),
  sf_hskill: assetPathToSrcdsSoundPath(srcdsAssets.sounds.sfHeadKillSound),
  sf_teamkill: assetPathToSrcdsSoundPath(srcdsAssets.sounds.sfTeamKillSound),
  slicer1: assetPathToSrcdsSoundPath(srcdsAssets.sounds.slicer1),
  slicer2: assetPathToSrcdsSoundPath(srcdsAssets.sounds.slicer2),
  slicer3: assetPathToSrcdsSoundPath(srcdsAssets.sounds.slicer3),
  slicer4: assetPathToSrcdsSoundPath(srcdsAssets.sounds.slicer4),
  blip1: assetPathToSrcdsSoundPath(srcdsAssets.sounds.blip1),
  button10: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button10),
  button14: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button14),
  button15: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button15),
  button16: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button16),
  button17: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button17),
  button18: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button18),
  button19: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button19),
  button24: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button24),
  button3: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button3),
  button9: assetPathToSrcdsSoundPath(srcdsAssets.sounds.button9),
  friend_join: assetPathToSrcdsSoundPath(srcdsAssets.sounds.friend_join),
  message: assetPathToSrcdsSoundPath(srcdsAssets.sounds.message),
  squashed: assetPathToSrcdsSoundPath(srcdsAssets.sounds.squashed),
  aheli_crash_alert2: assetPathToSrcdsSoundPath(
    srcdsAssets.sounds.aheli_crash_alert2,
  ),
  alert2: assetPathToSrcdsSoundPath(srcdsAssets.sounds.alert2),
  alert3: assetPathToSrcdsSoundPath(srcdsAssets.sounds.alert3),
  pain1: assetPathToSrcdsSoundPath(srcdsAssets.sounds.pain1),
  pain2: assetPathToSrcdsSoundPath(srcdsAssets.sounds.pain2),
  dog_playfull4: assetPathToSrcdsSoundPath(srcdsAssets.sounds.dog_playfull4),
  dog_playfull5: assetPathToSrcdsSoundPath(srcdsAssets.sounds.dog_playfull5),
  bat_away: assetPathToSrcdsSoundPath(srcdsAssets.sounds.bat_away),
  grind4: assetPathToSrcdsSoundPath(srcdsAssets.sounds.grind4),
  grind5: assetPathToSrcdsSoundPath(srcdsAssets.sounds.grind5),
  mh_blade_snick1: assetPathToSrcdsSoundPath(
    srcdsAssets.sounds.mh_blade_snick1,
  ),
  blade_cut: assetPathToSrcdsSoundPath(srcdsAssets.sounds.blade_cut),
  blade_in: assetPathToSrcdsSoundPath(srcdsAssets.sounds.blade_in),
  blade_out: assetPathToSrcdsSoundPath(srcdsAssets.sounds.blade_out),
  code2: assetPathToSrcdsSoundPath(srcdsAssets.sounds.code2),
  combine_mine_deactivate1: assetPathToSrcdsSoundPath(
    srcdsAssets.sounds.combine_mine_deactivate1,
  ),
  rmine_blip1: assetPathToSrcdsSoundPath(srcdsAssets.sounds.rmine_blip1),
  rmine_blip3: assetPathToSrcdsSoundPath(srcdsAssets.sounds.rmine_blip3),
  rmine_chirp_answer1: assetPathToSrcdsSoundPath(
    srcdsAssets.sounds.rmine_chirp_answer1,
  ),
  rmine_chirp_quest1: assetPathToSrcdsSoundPath(
    srcdsAssets.sounds.rmine_chirp_quest1,
  ),
  rmine_predetonate: assetPathToSrcdsSoundPath(
    srcdsAssets.sounds.rmine_predetonate,
  ),
  rmine_taunt1: assetPathToSrcdsSoundPath(srcdsAssets.sounds.rmine_taunt1),
  remote_yes: assetPathToSrcdsSoundPath(srcdsAssets.sounds.remote_yes),
  cbot_servoscared: assetPathToSrcdsSoundPath(
    srcdsAssets.sounds.cbot_servoscared,
  ),
  combat_scan1: assetPathToSrcdsSoundPath(srcdsAssets.sounds.combat_scan1),
  combat_scan2: assetPathToSrcdsSoundPath(srcdsAssets.sounds.combat_scan2),
  combat_scan3: assetPathToSrcdsSoundPath(srcdsAssets.sounds.combat_scan3),
  combat_scan4: assetPathToSrcdsSoundPath(srcdsAssets.sounds.combat_scan4),
  scanner_photo1: assetPathToSrcdsSoundPath(srcdsAssets.sounds.scanner_photo1),
  scanner_scan4: assetPathToSrcdsSoundPath(srcdsAssets.sounds.scanner_scan4),
  active: assetPathToSrcdsSoundPath(srcdsAssets.sounds.active),
  click1: assetPathToSrcdsSoundPath(srcdsAssets.sounds.click1),
  ping: assetPathToSrcdsSoundPath(srcdsAssets.sounds.ping),
};

export type HitSoundType = keyof typeof hitSounds;

export interface SoundInfo {
  path: string;
  name: string;
}

export const hitSoundNames: Record<HitSoundType, string> = {
  sf_body: 'SF body hit',
  sf_head: 'SF head hit',
  sf_kill: 'SF body kill',
  sf_hskill: 'SF headshot kill',
  sf_teamkill: 'SF teamkill',
  slicer1: 'slicer1',
  slicer2: 'slicer2',
  slicer3: 'slicer3',
  slicer4: 'slicer4',
  blip1: 'blip1',
  button10: 'button10',
  button14: 'button14',
  button15: 'button15',
  button16: 'button16',
  button17: 'button17',
  button18: 'button18',
  button19: 'button19',
  button24: 'button24',
  button3: 'button3',
  button9: 'button9',
  friend_join: 'friend_join',
  message: 'message',
  squashed: 'squashed',
  aheli_crash_alert2: 'aheli_crash_alert2',
  alert2: 'alert2',
  alert3: 'alert3',
  pain1: 'pain1',
  pain2: 'pain2',
  dog_playfull4: 'dog_playfull4',
  dog_playfull5: 'dog_playfull5',
  bat_away: 'bat_away',
  grind4: 'grind4',
  grind5: 'grind5',
  mh_blade_snick1: 'mh_blade_snick1',
  blade_cut: 'blade_cut',
  blade_in: 'blade_in',
  blade_out: 'blade_out',
  code2: 'code2',
  combine_mine_deactivate1: 'combine_mine_deactivate1',
  rmine_blip1: 'rmine_blip1',
  rmine_blip3: 'rmine_blip3',
  rmine_chirp_answer1: 'rmine_chirp_answer1',
  rmine_chirp_quest1: 'rmine_chirp_quest1',
  rmine_predetonate: 'rmine_predetonate',
  rmine_taunt1: 'rmine_taunt1',
  remote_yes: 'remote_yes',
  cbot_servoscared: 'cbot_servoscared',
  combat_scan1: 'combat_scan1',
  combat_scan2: 'combat_scan2',
  combat_scan3: 'combat_scan3',
  combat_scan4: 'combat_scan4',
  scanner_photo1: 'scanner_photo1',
  scanner_scan4: 'scanner_scan4',
  active: 'active',
  click1: 'click1',
  ping: 'ping',
};

export const defaultHitSounds: HitSoundPathsData = {
  body: hitSounds.sf_body,
  head: hitSounds.sf_head,
  kill: hitSounds.sf_kill,
  hskill: hitSounds.sf_hskill,
  teamkill: hitSounds.sf_teamkill,
};
