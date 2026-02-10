import { useState, useMemo } from "react";
import { X, Plus, Clock, History, ListTodo, ChevronDown, ChevronRight, Eye, Pencil, ArrowRight, RefreshCw, Check, ArrowUpDown, MessageSquarePlus, Phone, Mail, Calendar, FileText, User, MoreHorizontal, Trash2, CheckCircle, Handshake } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAllUsers } from "@/hooks/useUserDisplayNames";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Deal } from "@/types/deal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
  import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUserDisplayNames } from "@/hooks/useUserDisplayNames";
import { useAuth } from "@/hooks/useAuth";

interface DealExpandedPanelProps {
  deal: Deal;
  onClose: () => void;
   onOpenActionItemModal?: (actionItem?: any) => void;
}

 interface AuditLog {
   id: string;
   action: string;
   details: Record<string, unknown> | null;
   created_at: string;
   user_id: string | null;
 }
 
 interface ActionItem {
   id: string;
   title: string;
   status: string;
   priority: string;
   due_date: string | null;
   assigned_to: string | null;
   created_at: string;
   module_type: string;
   module_id: string | null;
 }
 
// Log types with icons
const LOG_TYPES = [
  { value: 'Note', label: 'Note', icon: FileText },
  { value: 'Call', label: 'Call', icon: Phone },
  { value: 'Meeting', label: 'Meeting', icon: Calendar },
  { value: 'Email', label: 'Email', icon: Mail },
] as const;

type LogType = typeof LOG_TYPES[number]['value'];

// Format date/time for table display: HH:mm dd-MM-yy
const formatHistoryDateTime = (date: Date): string => {
  return format(date, 'HH:mm dd-MM-yy');
};

// Format a value for display
const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
   }
  return String(value);
};

// Parse field_changes from audit log details
interface FieldChange {
  field: string;
  oldValue: string;
  newValue: string;
}

const parseFieldChanges = (details: Record<string, unknown> | null): FieldChange[] => {
  if (!details) return [];
  
  const fieldChanges = details.field_changes as Record<string, { old: unknown; new: unknown }> | undefined;
  if (fieldChanges && typeof fieldChanges === 'object') {
    return Object.entries(fieldChanges)
      .filter(([key]) => !['modified_at', 'modified_by', 'id'].includes(key))
      .map(([field, change]) => ({
        field: field.replace(/_/g, ' '),
        oldValue: formatValue(change?.old),
        newValue: formatValue(change?.new),
      }));
  }
  
  // Fallback: parse updated_fields or old_data if field_changes not available
  const oldData = details.old_data as Record<string, unknown> | undefined;
  const updatedFields = details.updated_fields as Record<string, unknown> | undefined;
  
  if (updatedFields && oldData) {
    return Object.keys(updatedFields)
      .filter(key => !['modified_at', 'modified_by', 'id'].includes(key))
      .map(field => ({
        field: field.replace(/_/g, ' '),
        oldValue: formatValue(oldData[field]),
        newValue: formatValue(updatedFields[field]),
      }));
  }
  
  // Final fallback: just show the details keys
  return Object.entries(details)
    .filter(([key]) => !['modified_at', 'modified_by', 'id', 'field_changes', 'old_data', 'updated_fields'].includes(key))
    .map(([field, value]) => ({
      field: field.replace(/_/g, ' '),
      oldValue: '-',
      newValue: formatValue(value),
    }));
};

// Parse audit log details to show human-readable summary
const parseChangeSummary = (action: string, details: Record<string, unknown> | null): string => {
  if (!details || typeof details !== 'object') return action === 'create' ? 'Created deal' : action;
  
  const changes = parseFieldChanges(details);
  if (changes.length === 0) return action === 'create' ? 'Created deal' : 'Updated';
  
  // For stage changes, show old → new
  const stageChange = changes.find(c => c.field === 'stage');
  if (stageChange) {
    return `${stageChange.oldValue} → ${stageChange.newValue}`;
  }
  
  // Show first change with arrow
  const first = changes[0];
  if (changes.length === 1) {
    return `${first.field}: ${first.oldValue} → ${first.newValue}`;
  }
  return `${first.field} +${changes.length - 1}`;
 };
 
 export const DealExpandedPanel = ({ deal, onClose, onOpenActionItemModal }: DealExpandedPanelProps) => {
  const { user } = useAuth();
   const [historyOpen, setHistoryOpen] = useState(true);
   const [actionsOpen, setActionsOpen] = useState(true);
    const [detailLogId, setDetailLogId] = useState<string | null>(null);
    const [actionSortBy, setActionSortBy] = useState<'due_date' | 'priority'>('due_date');
    const queryClient = useQueryClient();
    
    // Add Log dialog state
    const [addLogOpen, setAddLogOpen] = useState(false);
    const [logType, setLogType] = useState<LogType>('Note');
    const [logMessage, setLogMessage] = useState('');
    const [isSavingLog, setIsSavingLog] = useState(false);

    // Action items inline editing state
    const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
    const [editingDateId, setEditingDateId] = useState<string | null>(null);

    // History section state
    const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
    const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('All');
    const [historySortDirection, setHistorySortDirection] = useState<'desc' | 'asc'>('desc');

    const { users, getUserDisplayName } = useAllUsers();

  // Fetch audit logs for the deal
   const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
     queryKey: ['deal-audit-logs', deal.id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('security_audit_log')
         .select('*')
         .eq('resource_type', 'deals')
         .eq('resource_id', deal.id)
         .order('created_at', { ascending: false })
         .limit(50);
       
       if (error) {
         console.error('Error fetching deal audit logs:', error);
         return [];
       }
       
       return (data || []) as AuditLog[];
     },
     enabled: !!deal.id,
   });
 
   // Fetch action items from unified action_items table
   const { data: actionItems = [], isLoading: itemsLoading } = useQuery({
     queryKey: ['deal-action-items-unified', deal.id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('action_items')
         .select('*')
         .eq('module_type', 'deals')
         .eq('module_id', deal.id)
         .order('due_date', { ascending: true, nullsFirst: false });
       
       if (error) {
         console.error('Error fetching deal action items:', error);
         return [];
       }
       
       return (data || []) as ActionItem[];
     },
     enabled: !!deal.id,
   });
 
  // Extract unique user IDs from audit logs and action items
  const userIds = useMemo(() => {
    const logUserIds = auditLogs.map(log => log.user_id).filter((id): id is string => !!id);
    const actionUserIds = actionItems.map(item => item.assigned_to).filter((id): id is string => !!id);
    const ids = [...logUserIds, ...actionUserIds];
    return [...new Set(ids)];
  }, [auditLogs, actionItems]);
 
  // Fetch display names for users
  const { displayNames } = useUserDisplayNames(userIds);
 
   const isLoading = logsLoading || itemsLoading;

   // Refresh history logs
   const handleRefreshHistory = () => {
     queryClient.invalidateQueries({ queryKey: ['deal-audit-logs', deal.id] });
   };
   
   // Handle adding a manual log entry
   const handleAddLog = async () => {
     if (!logMessage.trim() || !user) return;
     
     setIsSavingLog(true);
     try {
       const { error } = await supabase
         .from('security_audit_log')
         .insert({
           action: logType.toUpperCase(),
           resource_type: 'deals',
           resource_id: deal.id,
           user_id: user.id,
           details: {
             message: logMessage.trim(),
             log_type: logType,
             manual_entry: true,
           }
         });
       
       if (error) throw error;
       
       // Refresh history
       queryClient.invalidateQueries({ queryKey: ['deal-audit-logs', deal.id] });
       
       // Reset form
       setLogMessage('');
       setLogType('Note');
       setAddLogOpen(false);
     } catch (error) {
       console.error('Error adding log:', error);
     } finally {
       setIsSavingLog(false);
     }
   };

    // History delete handlers
    const handleDeleteLog = async (id: string) => {
      await supabase.from('security_audit_log').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['deal-audit-logs', deal.id] });
      setSelectedLogIds(prev => prev.filter(i => i !== id));
    };

    const handleBulkDeleteLogs = async () => {
      for (const id of selectedLogIds) {
        await supabase.from('security_audit_log').delete().eq('id', id);
      }
      queryClient.invalidateQueries({ queryKey: ['deal-audit-logs', deal.id] });
      setSelectedLogIds([]);
    };

    // History filtering and sorting
    const filteredSortedLogs = useMemo(() => {
      let logs = [...auditLogs];
      if (historyTypeFilter !== 'All') {
        logs = logs.filter(log => {
          const action = log.action.toUpperCase();
          if (historyTypeFilter === 'System') return !['NOTE', 'CALL', 'MEETING', 'EMAIL'].includes(action);
          return action === historyTypeFilter.toUpperCase();
        });
      }
      logs.sort((a, b) => {
        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return historySortDirection === 'asc' ? diff : -diff;
      });
      return logs;
    }, [auditLogs, historyTypeFilter, historySortDirection]);

    const toggleAllLogs = () => {
      if (selectedLogIds.length === filteredSortedLogs.length) {
        setSelectedLogIds([]);
      } else {
        setSelectedLogIds(filteredSortedLogs.map(l => l.id));
      }
    };

    const toggleLogItem = (id: string) => {
      setSelectedLogIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const allLogsSelected = filteredSortedLogs.length > 0 && selectedLogIds.length === filteredSortedLogs.length;
    const someLogsSelected = selectedLogIds.length > 0 && selectedLogIds.length < filteredSortedLogs.length;

    const typeDotColor: Record<string, string> = {
      'NOTE': 'bg-yellow-500',
      'CALL': 'bg-blue-500',
      'MEETING': 'bg-purple-500',
      'EMAIL': 'bg-green-500',
      'update': 'bg-gray-400',
      'create': 'bg-emerald-500',
    };

    const getTypeDotColor = (action: string) => {
      return typeDotColor[action.toUpperCase()] || typeDotColor[action.toLowerCase()] || 'bg-muted-foreground';
    };

    // Toggle sort for action items
    const toggleActionSort = () => {
      setActionSortBy(prev => prev === 'due_date' ? 'priority' : 'due_date');
    };

   // Sort action items
   const sortedActionItems = useMemo(() => {
     return [...actionItems].sort((a, b) => {
       if (actionSortBy === 'due_date') {
         if (!a.due_date && !b.due_date) return 0;
         if (!a.due_date) return 1;
         if (!b.due_date) return -1;
         return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
       } else {
         const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
         return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
       }
     });
   }, [actionItems, actionSortBy]);
 
   const handleAddActionClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     if (onOpenActionItemModal) {
       onOpenActionItemModal();
    }
  };

    const handleActionItemClick = (actionItem: ActionItem) => {
      if (onOpenActionItemModal) {
        onOpenActionItemModal(actionItem);
     }
   };

    // Inline update handlers for action items
    const invalidateActionItems = () => {
      queryClient.invalidateQueries({ queryKey: ['deal-action-items-unified', deal.id] });
    };

    const handleStatusChange = async (id: string, status: string) => {
      await supabase.from('action_items').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      invalidateActionItems();
    };

    const handlePriorityChange = async (id: string, priority: string) => {
      await supabase.from('action_items').update({ priority, updated_at: new Date().toISOString() }).eq('id', id);
      invalidateActionItems();
    };

    const handleAssignedToChange = async (id: string, userId: string | null) => {
      await supabase.from('action_items').update({ assigned_to: userId, updated_at: new Date().toISOString() }).eq('id', id);
      invalidateActionItems();
    };

    const handleDueDateChange = async (id: string, date: string | null) => {
      await supabase.from('action_items').update({ due_date: date, updated_at: new Date().toISOString() }).eq('id', id);
      invalidateActionItems();
    };

    const handleDeleteActionItem = async (id: string) => {
      await supabase.from('action_items').delete().eq('id', id);
      invalidateActionItems();
    };

    const handleDueDateBlur = (itemId: string, value: string) => {
      handleDueDateChange(itemId, value || null);
      setEditingDateId(null);
    };

    const toggleAllActions = () => {
      if (selectedActionIds.length === sortedActionItems.length) {
        setSelectedActionIds([]);
      } else {
        setSelectedActionIds(sortedActionItems.map(i => i.id));
      }
    };

    const toggleActionItem = (id: string) => {
      setSelectedActionIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const allActionsSelected = sortedActionItems.length > 0 && selectedActionIds.length === sortedActionItems.length;
    const someActionsSelected = selectedActionIds.length > 0 && selectedActionIds.length < sortedActionItems.length;

    const statusDotColor: Record<string, string> = {
      'Open': 'bg-blue-500',
      'In Progress': 'bg-yellow-500',
      'Completed': 'bg-green-500',
      'Cancelled': 'bg-muted-foreground',
    };

    const priorityDotColor: Record<string, string> = {
      'High': 'bg-red-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-blue-500',
    };

    const selectedLog = detailLogId ? auditLogs.find(l => l.id === detailLogId) : null;

  return (
     <>
      <div 
         className="h-full w-full bg-card border border-border/50 rounded-lg shadow-lg flex flex-col overflow-hidden"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
         {/* Header - Simple title only */}
         <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-muted/30 flex-shrink-0">
           <span className="text-sm font-medium text-muted-foreground">Details</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
             className="h-6 w-6 p-0 hover:bg-muted"
          >
             <X className="h-4 w-4" />
          </Button>
        </div>

         {/* Content */}
         <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-1">
            {/* History Section - Collapsible with flex-1 for equal height */}
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className={`flex flex-col ${historyOpen ? 'flex-1' : ''} min-h-0`}>
              <CollapsibleTrigger asChild>
               <button className="w-full flex items-center gap-1.5 px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-colors border-b border-border/20 group">
                  {historyOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">History</span>
                  <span className="text-xs text-muted-foreground ml-1">({filteredSortedLogs.length})</span>
                  {/* Type filter */}
                  <div onClick={e => e.stopPropagation()} className="ml-auto">
                    <Select value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
                      <SelectTrigger className="h-5 w-auto min-w-0 text-[10px] border-0 bg-transparent hover:bg-muted/50 px-1.5 gap-1 [&>svg]:h-3 [&>svg]:w-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Note">Note</SelectItem>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Sort toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistorySortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                    }}
                    title={`Sort ${historySortDirection === 'desc' ? 'oldest first' : 'newest first'}`}
                  >
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[10px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddLogOpen(true);
                    }}
                  >
                    <MessageSquarePlus className="h-3 w-3" />
                    Add Log
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefreshHistory();
                    }}
                  >
                    <RefreshCw className={`h-3 w-3 text-muted-foreground ${logsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </button>
              </CollapsibleTrigger>
             <CollapsibleContent className="flex-1 min-h-0 collapsible-content data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="h-[280px] overflow-y-auto">
                     {/* Bulk actions bar */}
                     {selectedLogIds.length > 0 && (
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 border-b border-border/20">
                         <span className="text-[10px] text-muted-foreground">{selectedLogIds.length} selected</span>
                         <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-destructive hover:text-destructive gap-1" onClick={handleBulkDeleteLogs}>
                           <Trash2 className="h-3 w-3" /> Delete Selected
                         </Button>
                       </div>
                     )}
                     {isLoading ? (
                       <div className="flex items-center justify-center py-6">
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                       </div>
                     ) : filteredSortedLogs.length === 0 ? (
                       <div className="flex items-center justify-center py-6 text-muted-foreground">
                         <History className="h-4 w-4 mr-2" />
                         <span className="text-xs">{historyTypeFilter !== 'All' ? 'No matching logs' : 'No history yet'}</span>
                       </div>
                     ) : (
                       <Table>
                         <TableHeader>
                           <TableRow className="text-[11px] bg-muted/50">
                             <TableHead className="h-7 px-1 w-7">
                               <div className="flex items-center justify-center">
                                 <Checkbox checked={allLogsSelected} onCheckedChange={toggleAllLogs} className={someLogsSelected ? 'data-[state=checked]:bg-primary' : ''} />
                               </div>
                             </TableHead>
                             <TableHead className="h-7 px-2 text-[11px] font-bold">Changes</TableHead>
                             <TableHead className="h-7 px-2 text-[11px] font-bold w-20">By</TableHead>
                             <TableHead className="h-7 px-2 text-[11px] font-bold w-24">Time</TableHead>
                             <TableHead className="h-7 px-1 text-[11px] font-bold text-center" style={{ width: '6.67%', maxWidth: '6.67%' }}>Type</TableHead>
                             <TableHead className="h-7 px-1 w-8"></TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {filteredSortedLogs.map((log) => (
                             <TableRow key={log.id} className={cn("text-xs group cursor-pointer hover:bg-muted/30", selectedLogIds.includes(log.id) && 'bg-primary/5')}>
                               {/* Checkbox */}
                               <TableCell onClick={e => e.stopPropagation()} className="py-1.5 px-1 w-7">
                                 <div className="flex items-center justify-center">
                                   <Checkbox checked={selectedLogIds.includes(log.id)} onCheckedChange={() => toggleLogItem(log.id)} />
                                 </div>
                               </TableCell>

                               {/* Changes - clickable blue text */}
                               <TableCell className="py-1.5 px-2">
                                 <button 
                                   onClick={() => setDetailLogId(log.id)}
                                   className="hover:underline text-left whitespace-normal break-words text-[#2e538e] font-normal text-xs max-w-[200px] truncate block"
                                 >
                                   {(log.details as any)?.message || parseChangeSummary(log.action, log.details)}
                                 </button>
                               </TableCell>

                               {/* By */}
                               <TableCell className="py-1.5 px-2 text-muted-foreground max-w-[80px] truncate text-[10px]">
                                 {log.user_id ? (displayNames[log.user_id] || '...') : '-'}
                               </TableCell>

                               {/* Time */}
                               <TableCell className="py-1.5 px-2 text-[10px] text-muted-foreground whitespace-nowrap w-24">
                                 {formatHistoryDateTime(new Date(log.created_at))}
                               </TableCell>

                               {/* Type - colored dot with tooltip */}
                               <TableCell className="py-1.5 px-1 text-center" style={{ width: '6.67%', maxWidth: '6.67%' }}>
                                 <TooltipProvider>
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <div className="flex items-center justify-center">
                                         <div className={cn("h-2.5 w-2.5 rounded-full", getTypeDotColor(log.action))} />
                                       </div>
                                     </TooltipTrigger>
                                     <TooltipContent side="top" className="text-xs">
                                       <span className="capitalize">{log.action.toLowerCase()}</span>
                                     </TooltipContent>
                                   </Tooltip>
                                 </TooltipProvider>
                               </TableCell>

                               {/* Actions dropdown */}
                               <TableCell onClick={e => e.stopPropagation()} className="py-1.5 px-1 w-8">
                                 <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <MoreHorizontal className="h-3 w-3" />
                                     </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-36">
                                     <DropdownMenuItem onClick={() => setDetailLogId(log.id)}>
                                       <Eye className="h-3 w-3 mr-2" /> View Details
                                     </DropdownMenuItem>
                                     <DropdownMenuSeparator />
                                     <DropdownMenuItem onClick={() => handleDeleteLog(log.id)} className="text-destructive focus:text-destructive">
                                       <Trash2 className="h-3 w-3 mr-2" /> Delete
                                     </DropdownMenuItem>
                                   </DropdownMenuContent>
                                 </DropdownMenu>
                               </TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>
                     )}
                 </div>
              </CollapsibleContent>
            </Collapsible>
 
           {/* Action Items Section - Collapsible with flex-1 for equal height */}
           <Collapsible open={actionsOpen} onOpenChange={setActionsOpen} className={`flex flex-col ${actionsOpen ? 'flex-1' : ''} min-h-0`}>
             <CollapsibleTrigger asChild>
              <button className="w-full flex items-center gap-1.5 px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-colors border-b border-border/20 group">
                 {actionsOpen ? (
                   <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                 ) : (
                   <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                 )}
                 <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
                 <span className="text-xs font-medium text-foreground">Action Items</span>
                 <span className="text-xs text-muted-foreground ml-1">({actionItems.length})</span>
                 <Button
                   variant="ghost"
                   size="sm"
                   className="ml-auto h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={(e) => {
                     e.stopPropagation();
                     toggleActionSort();
                   }}
                   title={`Sort by ${actionSortBy === 'due_date' ? 'priority' : 'due date'}`}
                 >
                   <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                 </Button>
                 <span
                   role="button"
                   tabIndex={0}
                   onClick={handleAddActionClick}
                   onKeyDown={(e) => {
                     if (e.key === "Enter" || e.key === " ") {
                       e.preventDefault();
                       handleAddActionClick(e as unknown as React.MouseEvent);
                     }
                   }}
                   className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
                   aria-label="Add action item"
                 >
                   <Plus className="h-3 w-3 text-muted-foreground" />
                 </span>
               </button>
             </CollapsibleTrigger>
            <CollapsibleContent className="flex-1 min-h-0 collapsible-content data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
               <div className="h-[280px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      </div>
                    ) : actionItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <ListTodo className="h-4 w-4 mb-1" />
                        <span className="text-xs">No action items</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-xs h-6 mt-1"
                          onClick={() => onOpenActionItemModal?.()}
                        >
                          Add one
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="text-[11px] bg-muted/50">
                            <TableHead className="h-7 px-1 w-7">
                              <div className="flex items-center justify-center">
                                <Checkbox checked={allActionsSelected} onCheckedChange={toggleAllActions} className={someActionsSelected ? 'data-[state=checked]:bg-primary' : ''} />
                              </div>
                            </TableHead>
                            <TableHead className="h-7 px-2 text-[11px] font-bold">Task</TableHead>
                            <TableHead className="h-7 px-2 text-[11px] font-bold w-20">Assigned To</TableHead>
                            <TableHead className="h-7 px-2 text-[11px] font-bold w-16">Due Date</TableHead>
                            <TableHead className="h-7 px-1 text-[11px] font-bold text-center" style={{ width: '6.67%', maxWidth: '6.67%' }}>Status</TableHead>
                            <TableHead className="h-7 px-1 text-[11px] font-bold text-center" style={{ width: '6.67%', maxWidth: '6.67%' }}>Priority</TableHead>
                            <TableHead className="h-7 px-1 text-[11px] font-bold text-center" style={{ width: '6.67%', maxWidth: '6.67%' }}>Module</TableHead>
                            <TableHead className="h-7 px-1 w-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedActionItems.map((item) => (
                            <TableRow 
                              key={item.id} 
                              className={cn("text-xs group cursor-pointer hover:bg-muted/30", selectedActionIds.includes(item.id) && 'bg-primary/5')}
                              onClick={() => handleActionItemClick(item)}
                            >
                              {/* Checkbox */}
                              <TableCell onClick={e => e.stopPropagation()} className="py-1.5 px-1 w-7">
                                <div className="flex items-center justify-center">
                                  <Checkbox checked={selectedActionIds.includes(item.id)} onCheckedChange={() => toggleActionItem(item.id)} />
                                </div>
                              </TableCell>

                              {/* Task */}
                              <TableCell className="py-1.5 px-2">
                                <button onClick={e => { e.stopPropagation(); handleActionItemClick(item); }} className="hover:underline text-left whitespace-normal break-words text-[#2e538e] font-normal text-xs">
                                  {item.title}
                                </button>
                              </TableCell>

                              {/* Assigned To */}
                              <TableCell onClick={e => e.stopPropagation()} className="py-1.5 px-2 text-xs">
                                <Select value={item.assigned_to || 'unassigned'} onValueChange={value => handleAssignedToChange(item.id, value === 'unassigned' ? null : value)}>
                                  <SelectTrigger className="h-6 w-auto min-w-0 text-[11px] border-0 bg-transparent hover:bg-muted/50 px-0 [&>svg]:hidden">
                                    <SelectValue>
                                      <span className="truncate">{item.assigned_to ? getUserDisplayName(item.assigned_to) : 'Unassigned'}</span>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.display_name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </TableCell>

                              {/* Due Date */}
                              <TableCell onClick={e => e.stopPropagation()} className="py-1.5 px-2 text-xs">
                                {editingDateId === item.id ? (
                                  <Input type="date" defaultValue={item.due_date || ''} onBlur={e => handleDueDateBlur(item.id, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleDueDateBlur(item.id, (e.target as HTMLInputElement).value); else if (e.key === 'Escape') setEditingDateId(null); }} autoFocus className="h-6 w-[110px] text-[11px]" />
                                ) : (
                                  <button onClick={() => setEditingDateId(item.id)} className="hover:underline text-[11px]">
                                    {item.due_date ? format(new Date(item.due_date), 'dd-MM-yy') : '—'}
                                  </button>
                                )}
                              </TableCell>

                              {/* Status - dot only */}
                              <TableCell onClick={e => e.stopPropagation()} className="py-1.5 px-1 text-center" style={{ width: '6.67%', maxWidth: '6.67%' }}>
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex justify-center">
                                        <Select value={item.status} onValueChange={value => handleStatusChange(item.id, value)}>
                                          <SelectTrigger className="h-6 w-6 min-w-0 border-0 bg-transparent hover:bg-muted/50 px-0 justify-center [&>svg]:hidden">
                                            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', statusDotColor[item.status] || 'bg-muted-foreground')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Open"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />Open</div></SelectItem>
                                            <SelectItem value="In Progress"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500" />In Progress</div></SelectItem>
                                            <SelectItem value="Completed"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />Completed</div></SelectItem>
                                            <SelectItem value="Cancelled"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-muted-foreground" />Cancelled</div></SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">{item.status}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>

                              {/* Priority - dot only */}
                              <TableCell onClick={e => e.stopPropagation()} className="py-1.5 px-1 text-center" style={{ width: '6.67%', maxWidth: '6.67%' }}>
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex justify-center">
                                        <Select value={item.priority} onValueChange={value => handlePriorityChange(item.id, value)}>
                                          <SelectTrigger className="h-6 w-6 min-w-0 border-0 bg-transparent hover:bg-muted/50 px-0 justify-center [&>svg]:hidden">
                                            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityDotColor[item.priority] || 'bg-muted-foreground')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="High"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" />High</div></SelectItem>
                                            <SelectItem value="Medium"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500" />Medium</div></SelectItem>
                                            <SelectItem value="Low"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />Low</div></SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">{item.priority}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>

                              {/* Module - deal icon */}
                              <TableCell className="py-1.5 px-1 text-center" style={{ width: '6.67%', maxWidth: '6.67%' }}>
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex justify-center">
                                        <Handshake className="h-3.5 w-3.5 text-[#2e538e]" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Deal</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>

                              {/* Actions */}
                              <TableCell onClick={e => e.stopPropagation()} className="py-1.5 px-1">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleActionItemClick(item)}>
                                        <Pencil className="h-3.5 w-3.5 mr-2" />Edit
                                      </DropdownMenuItem>
                                      {item.status !== 'Completed' && (
                                        <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'Completed')}>
                                          <CheckCircle className="h-3.5 w-3.5 mr-2" />Mark Complete
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleDeleteActionItem(item.id)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
       </div>
 
       {/* Detail Log Dialog - With proper field changes table */}
       <Dialog open={!!detailLogId} onOpenChange={() => setDetailLogId(null)}>
        <DialogContent className="max-w-lg">
           <DialogHeader>
             <DialogTitle className="text-sm">History Details</DialogTitle>
           </DialogHeader>
          {selectedLog && (() => {
            const changes = parseFieldChanges(selectedLog.details);
            const updaterName = selectedLog.user_id ? (displayNames[selectedLog.user_id] || 'Unknown') : '-';
            
            return (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground text-xs">Action</span>
                    <p className="capitalize font-medium">{selectedLog.action}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Updated By</span>
                    <p className="font-medium">{updaterName}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground text-xs">Time</span>
                    <p>{format(new Date(selectedLog.created_at), 'PPpp')}</p>
                  </div>
                </div>
                
                {changes.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs block mb-2">Field Changes</span>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 px-3 text-xs font-medium">Field</TableHead>
                            <TableHead className="h-8 px-3 text-xs font-medium">Old Value</TableHead>
                            <TableHead className="h-8 px-3 text-xs font-medium w-6"></TableHead>
                            <TableHead className="h-8 px-3 text-xs font-medium">New Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {changes.map((change, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="py-2 px-3 text-xs font-medium capitalize">
                                {change.field}
                              </TableCell>
                              <TableCell className="py-2 px-3 text-xs text-muted-foreground max-w-[100px] truncate">
                                {change.oldValue}
                              </TableCell>
                              <TableCell className="py-2 px-3">
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              </TableCell>
                              <TableCell className="py-2 px-3 text-xs font-medium max-w-[100px] truncate">
                                {change.newValue}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                {changes.length === 0 && selectedLog.action === 'create' && (
                  <p className="text-muted-foreground text-xs italic">Deal was created</p>
                )}
              </div>
            );
          })()}
         </DialogContent>
       </Dialog>
       
       {/* Add Log Dialog */}
       <Dialog open={addLogOpen} onOpenChange={setAddLogOpen}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle className="text-sm flex items-center gap-2">
               <MessageSquarePlus className="h-4 w-4" />
               Add Log Entry
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div className="space-y-2">
               <Label className="text-xs">Log Type</Label>
               <Select value={logType} onValueChange={(v) => setLogType(v as LogType)}>
                 <SelectTrigger className="h-9">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {LOG_TYPES.map((type) => (
                     <SelectItem key={type.value} value={type.value}>
                       <div className="flex items-center gap-2">
                         <type.icon className="h-3.5 w-3.5" />
                         {type.label}
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label className="text-xs">Description</Label>
               <Textarea
                 value={logMessage}
                 onChange={(e) => setLogMessage(e.target.value)}
                 placeholder="Enter log details..."
                 className="min-h-[100px] text-sm"
               />
             </div>
             <div className="flex justify-end gap-2">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setAddLogOpen(false)}
               >
                 Cancel
               </Button>
               <Button
                 size="sm"
                 onClick={handleAddLog}
                 disabled={!logMessage.trim() || isSavingLog}
               >
                 {isSavingLog ? 'Saving...' : 'Add Log'}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </>
  );
};
