let userRole = "guest";


const roles = {

    guest: 0,

    tester: 1,

    operator: 2,

    admin: 5

};


export function setRole(role) {

    userRole = role;

    console.log(
        "[SECURITY] ROLE:",
        userRole,
        "CLEARANCE:",
        roles[userRole] ?? 0
    );

}


export function canAccess(level) {

    const clearance =
        roles[userRole] ?? 0;

    return clearance >= level;

}


export function getRole() {

    return userRole;

}


export function getClearance() {

    return roles[userRole] ?? 0;

}
