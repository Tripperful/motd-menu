export const permissionDescriptions = {
  match_organizer: 'Organize matches',
  maps_edit: 'Edit maps images, descriptions, etc',
  comments_edit: "Delete other players' comments/reviews",
  aka_edit: "Set players' A. K. A. names",
  teams_others_edit: "Change other players' teams",
  cvars_matchmaking_view: 'View matchmaking cvars',
  cvars_matchmaking_edit: 'Edit matchmaking cvars',
  cvars_admin_view: 'View admin cvars',
  cvars_admin_edit: 'Edit admin cvars',
  pub_change_maps: 'Change maps in public mode',
  tg_admin: 'Administrate Telegram bot',
  permissions_view: "View players' permissions",
  permissions_edit: "Edit players' permissions",
  news_create: 'Create news',
  news_publish: 'Publish news',
  custom_ranks_edit: "Edit players' custom ranks",
  rcon: 'Run server concommands via the menu',
  streamer: 'Allow streamer overlay',
  view_city: "View players' cities",
  dev: 'Developer',
};

export type Permission = keyof typeof permissionDescriptions;

export const allPermissions = Object.keys(
  permissionDescriptions,
) as Permission[];
