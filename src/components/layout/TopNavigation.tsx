import { Bell, Search, Settings, User, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useFirebaseTasks } from "@/hooks/useFirebaseTasks";
import { useFirebaseTeamHierarchyTasks } from "@/hooks/useFirebaseTeamHierarchyTasks";
import { useFirebaseProjects } from "@/hooks/useFirebaseProjects";
import { useTaskDeadlineNotifications } from "@/hooks/useTaskDeadlineNotifications";
import { db } from '@/integrations/firebase/client';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTaskDialog } from "@/components/forms/CreateTaskDialog";
import { getDeadlineInfo } from "@/utils/deadlines";

interface Notification {
  id: string;
  type: 'mention' | 'task_assigned' | 'task_completed' | 'task_overdue' | 'task_due_soon' | 'project_assigned' | 'project_completed' | 'comment';
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  timestamp: any;
}

export function TopNavigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { tasks } = useFirebaseTasks();
  const { teamTasks } = useFirebaseTeamHierarchyTasks();
  const { projects } = useFirebaseProjects();
  
  // Enable deadline notifications
  useTaskDeadlineNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Fetch notifications for the current user
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNotificationsLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Notification[];
      
      console.log('🔔 Notifications loaded:', notificationsData.length, 'total');
      setNotifications(notificationsData);
      setNotificationsLoading(false);
    }, (error) => {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
      setNotificationsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Combine personal and team tasks for search and notifications
  const allTasks = Array.from(new Map([...tasks, ...teamTasks].map(t => [t.id, t])).values());
  
  // Create search results that include both tasks and projects
  const searchResults = searchQuery.trim().length > 0 ? [
    // Filter tasks
    ...allTasks
      .filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: 'task' as const,
        item: task
      })),
    // Filter projects  
    ...projects
      .filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        type: 'project' as const,
        item: project
      }))
  ] : [];

  // Get urgent notifications (overdue and due soon tasks)
  const urgentTasks = allTasks.filter(task => {
    if (!task.due_date || task.status === 'completed') return false;
    const deadlineInfo = getDeadlineInfo(task.due_date, task.status, task.completed_at);
    const isUrgent = deadlineInfo.status === 'overdue' || deadlineInfo.status === 'due_soon';
    
    if (isUrgent) {
      console.log('🔔 Urgent task found:', {
        title: task.title,
        due_date: task.due_date,
        status: task.status,
        deadlineInfo
      });
    }
    
    return isUrgent;
  });

  // Get unread notifications
  const unreadNotifications = notifications.filter(n => !n.read);
  const mentionNotifications = notifications.filter(n => n.type === 'mention');
  const taskNotifications = notifications.filter(n => 
    ['task_assigned', 'task_completed', 'task_overdue', 'task_due_soon'].includes(n.type)
  );
  const projectNotifications = notifications.filter(n => 
    ['project_assigned', 'project_completed'].includes(n.type)
  );

  console.log('🔔 Notification system debug:', {
    allTasksCount: allTasks.length,
    urgentTasksCount: urgentTasks.length,
    totalNotifications: notifications.length,
    unreadNotifications: unreadNotifications.length,
    mentionNotifications: mentionNotifications.length,
    taskNotifications: taskNotifications.length,
    projectNotifications: projectNotifications.length,
    tasks: allTasks.map(t => ({ id: t.id, title: t.title, due_date: t.due_date, status: t.status }))
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      console.log('🔔 Removing notification:', notificationId);
      await deleteDoc(doc(db, 'notifications', notificationId));
      console.log('✅ Notification removed');
    } catch (error) {
      console.error('❌ Error removing notification:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      console.log('🔔 Removing all notifications');
      
      // Delete all notifications in parallel
      await Promise.all(
        notifications.map(notification => 
          deleteDoc(doc(db, 'notifications', notification.id))
        )
      );
      
      console.log('✅ All notifications removed');
    } catch (error) {
      console.error('❌ Error removing all notifications:', error);
    }
  };


  const handleItemClick = (result: typeof searchResults[0]) => {
    if (result.type === 'task') {
      navigate(`/tasks/${result.id}`);
    } else if (result.type === 'project') {
      navigate(`/projects/${result.id}`);
    }
    setSearchQuery("");
    setSearchOpen(false);
  };

  const getItemTypeLabel = (type: 'task' | 'project') => {
    switch (type) {
      case 'task':
        return 'Task';
      case 'project':
        return 'Project';
      default:
        return '';
    }
  };

  const getItemTypeBadgeVariant = (type: 'task' | 'project') => {
    switch (type) {
      case 'task':
        return 'secondary' as const;
      case 'project':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center">
              <div className="absolute inset-1 rounded-md bg-white/20"></div>
              <div className="relative z-10 flex flex-col gap-0.5 items-start">
                <div className="w-4 h-1 bg-white rounded-sm shadow-sm"></div>
                <div className="w-3.5 h-1 bg-white/90 rounded-sm shadow-sm"></div>
                <div className="w-3 h-1 bg-white/80 rounded-sm shadow-sm"></div>
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <div className="font-bold text-xl text-foreground">
                Taskflow
              </div>
              <div className="text-xs text-muted-foreground">
                Get it done!
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <Popover open={searchOpen || searchQuery.length > 0} onOpenChange={setSearchOpen} modal={false}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, projects..."
                  className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
              <div className="max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    <p className="text-sm text-muted-foreground mb-2 px-2">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    {searchResults.slice(0, 10).map(result => {
                      const deadlineInfo = result.type === 'task' ? getDeadlineInfo(result.item.due_date, result.item.status, result.item.completed_at) : null;
                      return (
                        <div
                          key={`${result.type}-${result.id}`}
                          className="p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleItemClick(result)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{result.title}</p>
                              {result.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {result.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={getItemTypeBadgeVariant(result.type)} className="text-xs">
                                  {getItemTypeLabel(result.type)}
                                </Badge>
                                {result.type === 'task' && (
                                  <Badge variant="outline" className="text-xs">
                                    {result.item.status.replace('_', ' ')}
                                  </Badge>
                                )}
                                {deadlineInfo?.badge && (
                                  <Badge variant={deadlineInfo.badge.variant} className="text-xs">
                                    {deadlineInfo.badge.text}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCreateTask(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
          
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {(urgentTasks.length > 0 || unreadNotifications.length > 0) && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    variant="destructive"
                  >
                    {urgentTasks.length + unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      {urgentTasks.length} urgent task{urgentTasks.length !== 1 ? 's' : ''}
                      {unreadNotifications.length > 0 && ` • ${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs"
                    >
                      Dismiss all
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Show task notifications first */}
                {taskNotifications.length > 0 && (
                  <div className="p-3 border-b bg-green-50">
                    <h5 className="text-sm font-medium text-green-900 mb-2">Tasks</h5>
                    {taskNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-2 hover:bg-green-100 cursor-pointer rounded border-l-2 ${
                          notification.read 
                            ? 'opacity-60 border-l-gray-300' 
                            : 'border-l-green-500 bg-green-50'
                        }`}
                        onClick={() => {
                          // Navigate to the task/project
                          if (notification.entityType && notification.entityId) {
                            navigate(`/${notification.entityType}s/${notification.entityId}`);
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-green-900'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-green-600">
                              {notification.timestamp && new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show project notifications */}
                {projectNotifications.length > 0 && (
                  <div className="p-3 border-b bg-purple-50">
                    <h5 className="text-sm font-medium text-purple-900 mb-2">Projects</h5>
                    {projectNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-2 hover:bg-purple-100 cursor-pointer rounded border-l-2 ${
                          notification.read 
                            ? 'opacity-60 border-l-gray-300' 
                            : 'border-l-purple-500 bg-purple-50'
                        }`}
                        onClick={async () => {
                          // Mark notification as read
                          if (!notification.read) {
                            await markNotificationAsRead(notification.id);
                          }
                          
                          // Navigate to the project
                          if (notification.entityType && notification.entityId) {
                            navigate(`/${notification.entityType}s/${notification.entityId}`);
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-purple-900'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-purple-600">
                              {notification.timestamp && new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show mention notifications */}
                {mentionNotifications.length > 0 && (
                  <div className="p-3 border-b bg-blue-50">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Mentions</h5>
                    {mentionNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-2 hover:bg-blue-100 cursor-pointer rounded border-l-2 ${
                          notification.read 
                            ? 'opacity-60 border-l-gray-300' 
                            : 'border-l-blue-500 bg-blue-50'
                        }`}
                        onClick={async () => {
                          // Mark notification as read
                          if (!notification.read) {
                            await markNotificationAsRead(notification.id);
                          }
                          
                          // Navigate to the task/project
                          if (notification.entityType && notification.entityId) {
                            navigate(`/${notification.entityType}s/${notification.entityId}`);
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-blue-900'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-blue-600">
                              {notification.timestamp && new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show urgent tasks */}
                {urgentTasks.length > 0 ? (
                  <div className="p-3">
                    <h5 className="text-sm font-medium mb-2">Urgent Tasks</h5>
                    {urgentTasks.map(task => {
                      const deadlineInfo = getDeadlineInfo(task.due_date, task.status, task.completed_at);
                      return (
                        <div
                          key={task.id}
                          className="p-2 hover:bg-muted cursor-pointer rounded"
                          onClick={() => {
                            navigate(`/tasks/${task.id}`);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {deadlineInfo.status === 'overdue' ? (
                              <div className="w-2 h-2 bg-destructive rounded-full mt-2" />
                            ) : (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {deadlineInfo.status === 'overdue' ? 'Overdue' : 'Due soon'}
                              </p>
                              {task.due_date && (
                                <p className="text-xs text-muted-foreground">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  urgentTasks.length === 0 && mentionNotifications.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      No urgent notifications
                    </div>
                  )
                )}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.email && (
                    <p className="text-sm font-medium">{user.email}</p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
    </header>
  );
}