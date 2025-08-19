
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Building2, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  contact_name: string;
  company_name: string;
  position: string;
  email: string;
  phone_no: string;
  industry: string;
  region: string;
  contact_source: string;
  created_time: string;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_time', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const getSourceColor = (source: string) => {
    const sourceColors = {
      'Website': 'status-info',
      'Referral': 'status-success',
      'Social Media': 'status-warning',
      'Email Campaign': 'bg-chart-4 text-white',
      'Cold Outreach': 'bg-muted'
    };
    return sourceColors[source as keyof typeof sourceColors] || 'bg-muted';
  };

  const filteredContacts = contacts.filter(contact =>
    contact.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Contacts</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">Your professional network and customer database</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">{filteredContacts.length} contacts</Badge>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <Card className="crm-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No contacts found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first contact"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="deal-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{contact.contact_name}</CardTitle>
                    <CardDescription>
                      {contact.position} {contact.company_name && `at ${contact.company_name}`}
                    </CardDescription>
                  </div>
                  {contact.contact_source && (
                    <Badge className={getSourceColor(contact.contact_source)}>
                      {contact.contact_source}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone_no && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone_no}</span>
                  </div>
                )}
                {contact.industry && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{contact.industry}</span>
                  </div>
                )}
                {contact.region && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{contact.region}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
