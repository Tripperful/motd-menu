import { WeaponType } from '@motd-menu/common/src/types/weapons';

export const enum IconGlyph {
  WeaponCrowbar = '\u{aa000}',
  WeaponStunstick = '\u{aa001}',
  WeaponPhyscannon = '\u{aa002}',
  WeaponPistol = '\u{aa003}',
  Weapon357 = '\u{aa004}',
  WeaponSmg1 = '\u{aa005}',
  WeaponAr2 = '\u{aa006}',
  WeaponShotgun = '\u{aa007}',
  WeaponCrossbow = '\u{aa008}',
  WeaponRpg = '\u{aa009}',
  WeaponSlam = '\u{aa00a}',
  WeaponFrag = '\u{aa00b}',
  Smg1Grenade = '\u{aa00c}',
  CombineBall = '\u{aa00d}',
  Physics = '\u{aa00e}',
  Suicide = '\u{aa00f}',
}

export const weaponIconsGlyphs: Partial<Record<WeaponType, string>> = {
  physics: IconGlyph.Physics,
  combine_ball: IconGlyph.CombineBall,
  smg1_grenade: IconGlyph.Smg1Grenade,
  crowbar: IconGlyph.WeaponCrowbar,
  stunstick: IconGlyph.WeaponStunstick,
  physcannon: IconGlyph.WeaponPhyscannon,
  pistol: IconGlyph.WeaponPistol,
  '357': IconGlyph.Weapon357,
  smg1: IconGlyph.WeaponSmg1,
  ar2: IconGlyph.WeaponAr2,
  shotgun: IconGlyph.WeaponShotgun,
  crossbow: IconGlyph.WeaponCrossbow,
  crossbow_bolt: IconGlyph.WeaponCrossbow,
  frag: IconGlyph.WeaponFrag,
  grenade_frag: IconGlyph.WeaponFrag,
  rpg: IconGlyph.WeaponRpg,
  rpg_missile: IconGlyph.WeaponRpg,
  slam: IconGlyph.WeaponSlam,
};

export const weaponNameToIconGlyph = (weaponName: string) => {
  if (weaponName?.startsWith('weapon_')) {
    weaponName = weaponName.substring(7);
  }

  return weaponIconsGlyphs[weaponName];
};
