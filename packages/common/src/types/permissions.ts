export type Permission =
  | 'permissions_view'
  | 'permissions_edit'
  | 'maps_edit'
  | 'teams_others_edit'
  | 'cvars_matchmaking_view'
  | 'cvars_matchmaking_edit'
  | 'cvars_admin_view'
  | 'cvars_admin_edit';

export const permissionDescriptions: Record<Permission, string> = {
  permissions_view: "View players' permissions",
  permissions_edit: "Edit players' permissions",
  maps_edit: 'Edit maps images, descriptions, comments, etc',
  teams_others_edit: "Change other players' teams",
  cvars_matchmaking_view: 'View matchmaking cvars',
  cvars_matchmaking_edit: 'Edit matchmaking cvars',
  cvars_admin_view: 'View admin cvars',
  cvars_admin_edit: 'Edit admin cvars',
};
