import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
export default function AddTicket() {
  const navigate = useNavigate();
  const {
    profile
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"ticket" | "incident">("ticket");

  // Ticket fields
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  // Incident fields
  const [title, setTitle] = useState("");
  const [impactedService, setImpactedService] = useState("");
  const [severity, setSeverity] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");

  // Common
  const [attachment, setAttachment] = useState<File | null>(null);
  const generateTicketNumber = (type: string) => {
    const prefix = type === "ticket" ? "TKT" : "INC";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.user_id) {
      toast.error("User not authenticated");
      return;
    }
    setLoading(true);
    try {
      const ticketNumber = generateTicketNumber(type);
      if (type === "ticket") {
        // Validate ticket fields
        if (!category || !subject || !description || !priority) {
          toast.error("Please fill in all required fields");
          setLoading(false);
          return;
        }
        const {
          error
        } = await supabase.from("tickets").insert({
          ticket_number: ticketNumber,
          title: subject,
          description,
          category,
          priority: priority.toLowerCase(),
          status: "open",
          created_by: profile.user_id
        });
        if (error) throw error;
        toast.success("Ticket created successfully");
      } else {
        // Validate incident fields
        if (!title || !description || !impactedService || !severity) {
          toast.error("Please fill in all required fields");
          setLoading(false);
          return;
        }
        const {
          error
        } = await supabase.from("incidents").insert({
          ticket_number: ticketNumber,
          title,
          description,
          impacted_service: impactedService,
          severity: severity.toLowerCase(),
          priority: "medium",
          status: "open",
          reported_by: profile.user_id,
          root_cause: rootCause || null,
          resolution_summary: resolutionSummary || null
        });
        if (error) throw error;
        toast.success("Incident created successfully");
      }
      navigate("/tickets");
    } catch (error: any) {
      console.error("Error creating:", error);
      toast.error(error.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };
  return <div className="container mx-auto py-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      

      <PageHeader title={`Create ${type === "ticket" ? "Ticket" : "Incident"}`} description={`Fill in the details to create a new ${type}`} />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Details</CardTitle>
            <Select value={type} onValueChange={(value: "ticket" | "incident") => setType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ticket">Ticket</SelectItem>
                <SelectItem value="incident">Incident</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {type === "ticket" ? <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Network">Network</SelectItem>
                      <SelectItem value="Access">Access</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="subject" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Subject
                  </Label>
                  <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of the issue" />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Description
                  </Label>
                  <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description of the issue" rows={6} />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="attachment">
                    Attachment (JPG/PNG/PDF)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <input id="file-upload" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setAttachment(e.target.files?.[0] || null)} className="hidden" />
                    {attachment && <span className="text-sm text-muted-foreground">{attachment.name}</span>}
                  </div>
                </div>
              </div> : <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Title
                  </Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief title of the incident" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impactedService" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Impacted Service
                  </Label>
                  <Input id="impactedService" value={impactedService} onChange={e => setImpactedService(e.target.value)} placeholder="e.g., Email Server, Database" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Severity
                  </Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="inc-description" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Description
                  </Label>
                  <Textarea id="inc-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description of the incident" rows={6} />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="rootCause">
                    Root Cause (Optional)
                  </Label>
                  <Textarea id="rootCause" value={rootCause} onChange={e => setRootCause(e.target.value)} placeholder="What caused this incident?" rows={3} />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="resolutionSummary">
                    Resolution Summary (Optional)
                  </Label>
                  <Textarea id="resolutionSummary" value={resolutionSummary} onChange={e => setResolutionSummary(e.target.value)} placeholder="How was this resolved?" rows={3} />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="inc-attachment">
                    Attachment
                  </Label>
                  <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" onClick={() => document.getElementById("inc-file-upload")?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <input id="inc-file-upload" type="file" onChange={e => setAttachment(e.target.files?.[0] || null)} className="hidden" />
                    {attachment && <span className="text-sm text-muted-foreground">{attachment.name}</span>}
                  </div>
                </div>
              </div>}

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/tickets")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : `Create ${type === "ticket" ? "Ticket" : "Incident"}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>;
}