require.context('../assets/game', true);

export const enum SoundCategory {
  Default = 0,
}

export interface SoundInfo {
  assetPath: string;
  srcdsPath: string;
  name: string;
}

const registeredSounds: Record<number, SoundInfo[]> = {};

export const getPickableSounds = (category: SoundCategory) =>
  registeredSounds[category] || [];

const registerPickableSound = (
  name: string,
  srcdsPath: string,
  category: SoundCategory,
) => {
  registeredSounds[category] ??= [];
  registeredSounds[category].push({
    assetPath: '/game/sound/' + srcdsPath,
    srcdsPath,
    name,
  });
};

registerPickableSound(
  'SF Body Hit',
  'sf_vox/hitbody.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'SF Head Hit',
  'sf_vox/hithead.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'SF Body Kill',
  'sf_vox/frag_snd.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'SF Head Kill',
  'sf_vox/headshot_kill_snd.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'SF Team Kill',
  'sf_vox/tkill.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'slicer1',
  'ambient/machines/slicer1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'slicer2',
  'ambient/machines/slicer2.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'slicer3',
  'ambient/machines/slicer3.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'slicer4',
  'ambient/machines/slicer4.wav',
  SoundCategory.Default,
);
registerPickableSound('blip1', 'buttons/blip1.wav', SoundCategory.Default);
registerPickableSound(
  'button10',
  'buttons/button10.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'button14',
  'buttons/button14.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'button15',
  'buttons/button15.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'button16',
  'buttons/button16.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'button17',
  'buttons/button17.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'button18',
  'buttons/button18.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'button19',
  'buttons/button19.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'button24',
  'buttons/button24.wav',
  SoundCategory.Default,
);
registerPickableSound('button3', 'buttons/button3.wav', SoundCategory.Default);
registerPickableSound('button9', 'buttons/button9.wav', SoundCategory.Default);
registerPickableSound(
  'friend_join',
  'friends/friend_join.wav',
  SoundCategory.Default,
);
registerPickableSound('message', 'friends/message.wav', SoundCategory.Default);
registerPickableSound(
  'squashed',
  'npc/antlion_grub/squashed.wav',
  SoundCategory.Default,
);
registerPickableSound('alert2', 'npc/crow/alert2.wav', SoundCategory.Default);
registerPickableSound('alert3', 'npc/crow/alert3.wav', SoundCategory.Default);
registerPickableSound('pain1', 'npc/crow/pain1.wav', SoundCategory.Default);
registerPickableSound('pain2', 'npc/crow/pain2.wav', SoundCategory.Default);
registerPickableSound(
  'dog_playfull4',
  'npc/dog/dog_playfull4.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'dog_playfull5',
  'npc/dog/dog_playfull5.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'bat_away',
  'npc/manhack/bat_away.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'grind4',
  'npc/manhack/grind4.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'grind5',
  'npc/manhack/grind5.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'mh_blade_snick1',
  'npc/manhack/mh_blade_snick1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'blade_cut',
  'npc/roller/blade_cut.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'blade_in',
  'npc/roller/blade_in.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'blade_out',
  'npc/roller/blade_out.wav',
  SoundCategory.Default,
);
registerPickableSound('code2', 'npc/roller/code2.wav', SoundCategory.Default);
registerPickableSound(
  'combine_mine_deactivate1',
  'npc/roller/mine/combine_mine_deactivate1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'rmine_blip1',
  'npc/roller/mine/rmine_blip1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'rmine_blip3',
  'npc/roller/mine/rmine_blip3.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'rmine_chirp_answer1',
  'npc/roller/mine/rmine_chirp_answer1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'rmine_chirp_quest1',
  'npc/roller/mine/rmine_chirp_quest1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'rmine_predetonate',
  'npc/roller/mine/rmine_predetonate.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'rmine_taunt1',
  'npc/roller/mine/rmine_taunt1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'remote_yes',
  'npc/roller/remote_yes.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'cbot_servoscared',
  'npc/scanner/cbot_servoscared.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'combat_scan1',
  'npc/scanner/combat_scan1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'combat_scan2',
  'npc/scanner/combat_scan2.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'combat_scan3',
  'npc/scanner/combat_scan3.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'combat_scan4',
  'npc/scanner/combat_scan4.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'scanner_photo1',
  'npc/scanner/scanner_photo1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'scanner_scan4',
  'npc/scanner/scanner_scan4.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'active',
  'npc/turret_floor/active.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'click1',
  'npc/turret_floor/click1.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'ping',
  'npc/turret_floor/ping.wav',
  SoundCategory.Default,
);
registerPickableSound(
  'flesh_bloody_break',
  'physics/flesh/flesh_bloody_break.wav',
  SoundCategory.Default,
);