export const permissionDescriptions = {
  match_organizer: 'Organize matches',
  maps_edit: 'Edit maps images, descriptions, etc',
  comments_edit: "Delete other players' comments/reviews",
  teams_others_edit: "Change other players' teams",
  cvars_matchmaking_view: 'View matchmaking cvars',
  cvars_matchmaking_edit: 'Edit matchmaking cvars',
  cvars_admin_view: 'View admin cvars',
  cvars_admin_edit: 'Edit admin cvars',
  permissions_view: "View players' permissions",
  permissions_edit: "Edit players' permissions",
  dev: 'Developer',
};

export type Permission = keyof typeof permissionDescriptions;

export const allPermissions = Object.keys(
  permissionDescriptions,
) as Permission[];
