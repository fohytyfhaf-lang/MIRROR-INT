let userRole = "guest";

const roles = {
  guest: 0,
  operator: 1,
  admin: 2
};

export function setRole(role) {
  userRole = role;
}

export function canAccess(level) {
  return roles[userRole] >= level;
}

export function getRole() {
  return userRole;
}
