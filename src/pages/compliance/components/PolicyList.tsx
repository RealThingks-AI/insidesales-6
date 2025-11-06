import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Download, Search } from "lucide-react";
import { ITPolicy, PolicyFilters } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PolicyListProps {
  policies: ITPolicy[];
  filters: PolicyFilters;
  onFiltersChange: (filters: PolicyFilters) => void;
  onAddPolicy: () => void;
  onEditPolicy: (policy: ITPolicy) => void;
  onRefresh: () => void;
  canManage: boolean;
}

export default function PolicyList({
  policies,
  filters,
  onFiltersChange,
  onAddPolicy,
  onEditPolicy,
  onRefresh,
  canManage
}: PolicyListProps) {
  const [deletePolicy, setDeletePolicy] = useState<ITPolicy | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletePolicy) return;

    setDeleting(true);
    try {
      // Delete attached files from storage
      if (deletePolicy.attachments && deletePolicy.attachments.length > 0) {
        const filePaths = deletePolicy.attachments.map(f => f.path);
        await supabase.storage.from('policy-documents').remove(filePaths);
      }

      const { error } = await supabase
        .from('it_policies')
        .delete()
        .eq('id', deletePolicy.id);

      if (error) throw error;
      toast.success('Policy deleted successfully');
      onRefresh();
      setDeletePolicy(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('policy-documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Failed to download file');
    }
  };

  const filteredPolicies = policies.filter(policy => {
    if (filters.status !== 'all' && policy.status !== filters.status) return false;
    if (filters.category && policy.category !== filters.category) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        policy.policy_name.toLowerCase().includes(searchLower) ||
        (policy.owner?.full_name || '').toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <Badge variant="default" className="bg-green-600">Compliant</Badge>;
      case 'Non-Compliant':
        return <Badge variant="destructive">Non-Compliant</Badge>;
      case 'Under Review':
        return <Badge variant="secondary">Under Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const categories = Array.from(new Set(policies.map(p => p.category))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 flex-1 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by policy name or owner..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value: any) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Compliant">Compliant</SelectItem>
              <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button onClick={onAddPolicy}>
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy ID</TableHead>
              <TableHead>Policy Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Last Review</TableHead>
              <TableHead>Next Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No policies found
                </TableCell>
              </TableRow>
            ) : (
              filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-mono text-sm">{policy.policy_id}</TableCell>
                  <TableCell className="font-medium">{policy.policy_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{policy.category}</Badge>
                  </TableCell>
                  <TableCell>{policy.owner?.full_name || '-'}</TableCell>
                  <TableCell>{policy.review_frequency}</TableCell>
                  <TableCell className="text-sm">
                    {policy.last_review_date ? format(new Date(policy.last_review_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {policy.next_review_date ? format(new Date(policy.next_review_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(policy.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {policy.attachments && policy.attachments.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(policy.attachments[0].path, policy.attachments[0].name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {canManage && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditPolicy(policy)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletePolicy(policy)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deletePolicy} onOpenChange={() => setDeletePolicy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletePolicy?.policy_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
