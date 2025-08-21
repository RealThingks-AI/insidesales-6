
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LeadColumn } from "@/types/columns";

interface LeadColumnCustomizerProps {
  columns: LeadColumn[];
  onUpdate: (columns: LeadColumn[]) => void;
  onClose: () => void;
}

export const LeadColumnCustomizer = ({ 
  columns, 
  onUpdate,
  onClose 
}: LeadColumnCustomizerProps) => {
  const [localColumns, setLocalColumns] = useState<LeadColumn[]>(columns);

  const handleVisibilityChange = (key: string, visible: boolean) => {
    const updatedColumns = localColumns.map(col => 
      col.key === key ? { ...col, visible } : col
    );
    setLocalColumns(updatedColumns);
  };

  const handleSave = () => {
    onUpdate(localColumns);
    onClose();
  };

  const handleReset = () => {
    const defaultColumns: LeadColumn[] = [
      { key: 'lead_name', label: 'Lead Name', visible: true, order: 0 },
      { key: 'company_name', label: 'Company Name', visible: true, order: 1 },
      { key: 'position', label: 'Position', visible: true, order: 2 },
      { key: 'email', label: 'Email', visible: true, order: 3 },
      { key: 'phone_no', label: 'Phone', visible: true, order: 4 },
      { key: 'country', label: 'Region', visible: true, order: 5 },
      { key: 'contact_owner', label: 'Lead Owner', visible: true, order: 6 },
      { key: 'lead_status', label: 'Lead Status', visible: true, order: 7 },
      { key: 'industry', label: 'Industry', visible: false, order: 8 },
      { key: 'contact_source', label: 'Source', visible: false, order: 9 },
    ];
    setLocalColumns(defaultColumns);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Customize Columns</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Tip:</strong> Check/uncheck to show/hide columns in the lead table.
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
            {localColumns.map((column) => (
              <div
                key={column.key}
                className="flex items-center space-x-3 p-3 border rounded-lg bg-card hover:bg-muted/30"
              >
                <Checkbox
                  id={column.key}
                  checked={column.visible}
                  onCheckedChange={(checked) => 
                    handleVisibilityChange(column.key, Boolean(checked))
                  }
                />
                
                <Label
                  htmlFor={column.key}
                  className="flex-1 cursor-pointer"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <Button onClick={handleSave}>
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
