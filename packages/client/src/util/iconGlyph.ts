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
  AmmoAr2 = '\u{0aa020}',
  AmmoShotgun = '\u{0aa021}',
  AmmoSmg1 = '\u{0aa022}',
  Ammo357 = '\u{0aa023}',
  AmmoPistol = '\u{0aa024}',
  AmmoCrossbow = '\u{0aa025}',
  HealthVial = '\u{0aa026}',
  HealthKit = '\u{0aa027}',
  Battery = '\u{0aa028}',
  RpgRound = '\u{0aa029}',
  ItemSmg1Grenade = '\u{0aa02a}',
  ItemCombineBall = '\u{0aa02b}',
  Charger = '\u{0aa02c}',
}

export const itemIconsGlyphs: Partial<Record<string, string>> = {
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
  suicide: IconGlyph.Suicide,
  ammo_357: IconGlyph.Ammo357,
  ammo_357_large: IconGlyph.Ammo357,
  ammo_pistol: IconGlyph.AmmoPistol,
  ammo_pistol_large: IconGlyph.AmmoPistol,
  ammo_ar2: IconGlyph.AmmoAr2,
  ammo_ar2_large: IconGlyph.AmmoAr2,
  ammo_ar2_altfire: IconGlyph.ItemCombineBall,
  ammo_smg1: IconGlyph.AmmoSmg1,
  ammo_smg1_large: IconGlyph.AmmoSmg1,
  ammo_smg1_grenade: IconGlyph.ItemSmg1Grenade,
  ammo_crossbow: IconGlyph.AmmoCrossbow,
  box_buckshot: IconGlyph.AmmoShotgun,
  rpg_round: IconGlyph.RpgRound,
  battery: IconGlyph.Battery,
  healthkit: IconGlyph.HealthKit,
  healthvial: IconGlyph.HealthVial,
  charger: IconGlyph.Charger,
};

export const itemNameToIconGlyph = (itemName: string) => {
  if (itemName?.startsWith('weapon_')) {
    itemName = itemName.substring(7);
  }

  if (itemName?.startsWith('item_')) {
    itemName = itemName.substring(5);
  }

  return itemIconsGlyphs[itemName] || itemIconsGlyphs.suicide;
};
