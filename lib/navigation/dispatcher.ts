import { adminNavigation } from "./admin";
import { commonNavigation, type NavigationGroup, type PortalRole } from "./common";
import { driverNavigation } from "./driver";
import { partnerNavigation } from "./partner";

const roleNavigation: Record<PortalRole, NavigationGroup[]> = {
  admin: adminNavigation,
  partner: partnerNavigation,
  driver: driverNavigation,
};

export function navigationDispatcher(role: PortalRole): NavigationGroup[] {
  if (role === "admin") {
    return adminNavigation;
  }

  return [...commonNavigation, ...roleNavigation[role]];
}
