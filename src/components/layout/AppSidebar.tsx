import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FolderOpen,
  BarChart3,
  Users,
  Settings,
  UserCog,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useFirebaseProfile } from "@/hooks/useFirebaseProfile";
import { useFirebaseRBAC } from "@/hooks/useFirebaseRBAC";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "My Reports", url: "/my-reports", icon: BarChart3 },
];

const adminItems = [
  { title: "User Management", url: "/user-management", icon: UserCog },
  { title: "Team Reports", url: "/team-reports", icon: BarChart3 },
  { title: "Organization Reports", url: "/organization-reports", icon: BarChart3 },
];

const settingsItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, isManager, loading } = useFirebaseProfile();
  const { isHR, isSeniorManagement, isDirector } = useFirebaseRBAC();
  
  // Debug logging
  console.log('Sidebar Debug:', { profile, isManager, loading });
  console.log('RBAC Debug:', { isHR, isSeniorManagement, role: profile?.role });
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  
  const getNavClasses = (path: string) => {
    return isActive(path) 
      ? "bg-accent text-accent-foreground font-medium" 
      : "hover:bg-accent/50";
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
            {navigationItems.map((item) => {
              // Temporarily show Team link to all users for testing
              // TODO: Add proper role-based access control
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              );
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Team Management - Available to all users */}
        <SidebarGroup>
          <SidebarGroupLabel>Team</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/team-management" className={getNavClasses("/team-management")}>
                    <Users className="h-4 w-4" />
                    <span>Team Management</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Show different items based on role */}
        {(isManager || isDirector || isSeniorManagement || isHR) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  // Show User Management to HR and Senior Management
                  if (item.title === "User Management" && !isHR && !isSeniorManagement) {
                    return null;
                  }
                  
                  // Show Team Reports to Managers, Directors, and Senior Management
                  if (item.title === "Team Reports" && !isManager && !isDirector && !isSeniorManagement) {
                    return null;
                  }
                  
                  // Show Organization Reports to HR and Senior Management
                  if (item.title === "Organization Reports" && !isHR && !isSeniorManagement) {
                    return null;
                  }
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClasses(item.url)}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}