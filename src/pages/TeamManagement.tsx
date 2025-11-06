import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFirebaseProfile, Profile } from "@/hooks/useFirebaseProfile";
import { useFirebaseRBAC } from "@/hooks/useFirebaseRBAC";
import { useFirebaseTeamMembers, TeamMember } from "@/hooks/useFirebaseTeamMembers";
import { useFirebaseTeamManagement } from "@/hooks/useFirebaseTeamManagement";
import { useFirebaseTeams, Team } from "@/hooks/useFirebaseTeams";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { Users, MoreHorizontal, Shield } from "lucide-react";
import { format } from "date-fns";

interface TeamMember extends Profile {
  email?: string;
}

interface TeamNodeProps {
  team: any;
  members: Record<string, TeamMember[]>;
  onUpdateMemberStatus: (params: { userId: string; status: 'active' | 'deactivated' }) => void;
  level: number;
}

function TeamNode({ team, members, onUpdateMemberStatus, level }: TeamNodeProps) {
  const indentClass = level === 0 ? '' : level === 1 ? 'ml-6' : 'ml-12';
  const teamMembers = members[team.id] || [];
  
  return (
    <div className={`${indentClass} space-y-4`}>
      {/* Team Header */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <Badge variant="secondary">
                {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Team Members */}
        <div className="p-4">
          {teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{member.full_name || "Not set"}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{member.role}</Badge>
                    <span className="text-sm text-muted-foreground">Team: {team.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                      {member.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.status === 'active' ? (
                          <DropdownMenuItem
                            onClick={() => onUpdateMemberStatus({
                              userId: member.user_id,
                              status: 'deactivated'
                            })}
                          >
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onUpdateMemberStatus({
                              userId: member.user_id,
                              status: 'active'
                            })}
                          >
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No members in this team
            </div>
          )}
        </div>
      </div>
      
      {/* Child Teams */}
      {team.children && team.children.length > 0 && (
        <div className="space-y-4">
          {team.children.map((child: any) => (
            <TeamNode
              key={child.id}
              team={child}
              members={members}
              onUpdateMemberStatus={onUpdateMemberStatus}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamManagement() {
  const { profile } = useFirebaseProfile();
  const { teamHierarchy, canManageUsers, canManageTeams, isHR } = useFirebaseRBAC();
  const { teamMembers, loading: membersLoading } = useFirebaseTeamMembers();
  const { teams, loading: teamsLoading, getTeamHierarchy } = useFirebaseTeams();
  const { updateMemberStatus, updateMemberRole, updateMemberTeam, loading: managementLoading } = useFirebaseTeamManagement();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [isCreatingTeams, setIsCreatingTeams] = useState(false);

  // Group members by team
  const membersByTeam = useMemo(() => {
    // Debug: Log all team members to see their actual data
    console.log('Team Management - All team members:', teamMembers);
    teamMembers.forEach(member => {
      console.log(`Member ${member.fullName}:`, {
        status: member.status,
        isActive: member.isActive,
        role: member.role,
        teamId: member.teamId
      });
    });
    
    return teamMembers.reduce((acc, member) => {
      if (!member.teamId) return acc;
      if (!acc[member.teamId]) acc[member.teamId] = [];
      acc[member.teamId].push(member);
      return acc;
    }, {} as Record<string, TeamMember[]>);
  }, [teamMembers]);

  // Function to fix undefined status fields
  const fixUndefinedStatus = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to fix status fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const batch = writeBatch(db);
      let fixedCount = 0;

      teamMembers.forEach(member => {
        const needsStatusFix = member.status === undefined || member.status === null;
        const needsActiveFix = member.isActive === undefined || member.isActive === null;
        const isInconsistent = (member.status === 'active' && member.isActive === false) || 
                              (member.status === 'deactivated' && member.isActive === true) ||
                              (member.status === 'active' && member.isActive === true && member.deactivatedAt);
        
        if (needsStatusFix || needsActiveFix || isInconsistent) {
          const profileRef = doc(db, 'profiles', member.id);
          
          // Determine the correct values based on existing data
          // If deactivatedAt exists, user should be deactivated
          const shouldBeDeactivated = member.deactivatedAt || member.isActive === false || member.status === 'deactivated';
          const correctStatus = shouldBeDeactivated ? 'deactivated' : 'active';
          const correctIsActive = !shouldBeDeactivated;
          
          const updateData: any = {
            status: correctStatus,
            isActive: correctIsActive,
            updatedAt: new Date().toISOString()
          };
          
          // If user should be active, remove deactivatedAt field
          if (!shouldBeDeactivated && member.deactivatedAt) {
            updateData.deactivatedAt = null;
          }
          
          batch.update(profileRef, updateData);
          fixedCount++;
        }
      });

      if (fixedCount > 0) {
        await batch.commit();
        toast({
          title: "Success",
          description: `Fixed ${fixedCount} user status fields`,
        });
      } else {
        toast({
          title: "Info",
          description: "No undefined status fields found",
        });
      }
    } catch (error: any) {
      console.error('Error fixing status fields:', error);
      toast({
        title: "Error",
        description: "Failed to fix status fields: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Function to create the team structure
  const createTeams = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create teams",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingTeams(true);
    try {
      const teamsToAdd = [
        {
          id: 'engineering-1',
          name: 'Engineering 1',
          description: 'Main engineering team',
          parentTeamId: null,
          managerId: user.uid,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'engineering-2',
          name: 'Engineering 2',
          description: 'Sub-engineering team under Engineering 1',
          parentTeamId: 'engineering-1',
          managerId: user.uid,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'hr',
          name: 'HR',
          description: 'Human Resources team',
          parentTeamId: null,
          managerId: user.uid,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'senior-management',
          name: 'Senior Management',
          description: 'Senior Management team - oversees all teams',
          parentTeamId: null,
          managerId: user.uid,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const team of teamsToAdd) {
        const teamRef = doc(db, 'teams', team.id);
        await setDoc(teamRef, team, { merge: true });
      }

      toast({
        title: "Success",
        description: "Teams created successfully! Engineering 1, Engineering 2, HR, and Senior Management teams have been added.",
      });
    } catch (error: any) {
      console.error('Error creating teams:', error);
      toast({
        title: "Error",
        description: "Failed to create teams: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingTeams(false);
    }
  };

  // Access restriction removed - all users can now access team management

  if (membersLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">
          View your organization structure and team members ({profile?.role})
        </p>
      </div>

      {/* Organization Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Structure</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete organizational hierarchy with team members
          </p>
        </CardHeader>
        <CardContent>
          {teamsLoading || membersLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teams found. Click the "Create Team Structure" button above to set up your organization.</p>
              {isHR && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">This will create:</p>
                  <ul className="text-sm text-left space-y-1">
                    <li>• Engineering 1 (top-level team)</li>
                    <li>• Engineering 2 (under Engineering 1)</li>
                    <li>• HR (top-level team)</li>
                    <li>• Senior Management (top-level team)</li>
                  </ul>
                </div>
              )}
              {!isHR && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Only HR users can create teams. Please contact your HR administrator.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                const hierarchy = getTeamHierarchy();
                const rootTeams = hierarchy['root'] || [];
                
                const renderTeam = (team: Team, level: number = 0) => {
                  const subTeams = hierarchy[team.id] || [];
                  const teamMembers = membersByTeam[team.id] || [];
                  
                  return (
                    <div key={team.id} className="space-y-4">
                      <div className={`border rounded-lg p-4 ${level > 0 ? 'ml-6 border-l-2 border-l-primary' : ''}`}>
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold">{team.name}</h3>
                          {team.description && (
                            <p className="text-sm text-muted-foreground">{team.description}</p>
                          )}
                        </div>
                        
                        {teamMembers.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {teamMembers.map((member) => (
                              <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                      {member.fullName?.charAt(0) || '?'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {member.fullName || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {member.email || 'No email'}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {member.role || 'Staff'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {teamMembers.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">No members in this team</p>
                        )}
                      </div>
                      
                      {/* Render sub-teams */}
                      {subTeams.map(subTeam => renderTeam(subTeam, level + 1))}
                    </div>
                  );
                };
                
                return rootTeams.map(team => renderTeam(team));
              })()}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}