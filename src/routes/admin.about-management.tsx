import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMemberForm } from "@/components/admin/TeamMemberForm";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { fetchTeamMembers, fetchPartners, deleteTeamMember, deletePartner, type TeamMemberRow, type PartnerRow } from "@/services/content";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/about-management")({
  component: AboutManagement,
});

function AboutManagement() {
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMemberRow | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<PartnerRow | null>(null);
  const [isTeamMemberDialogOpen, setIsTeamMemberDialogOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading: teamMembersLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: fetchTeamMembers,
  });

  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: fetchPartners,
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete team member: " + error.message);
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete partner: " + error.message);
    },
  });

  const handleEditTeamMember = (member: TeamMemberRow) => {
    setSelectedTeamMember(member);
    setIsTeamMemberDialogOpen(true);
  };

  const handleEditPartner = (partner: PartnerRow) => {
    setSelectedPartner(partner);
    setIsPartnerDialogOpen(true);
  };

  const handleDeleteTeamMember = (id: string) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      deleteTeamMemberMutation.mutate(id);
    }
  };

  const handleDeletePartner = (id: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      deletePartnerMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">About Management</h1>
          <p className="text-muted-foreground">Manage team members and partners for the About page</p>
        </div>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Partners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Dialog open={isTeamMemberDialogOpen} onOpenChange={setIsTeamMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedTeamMember(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTeamMember ? "Edit Team Member" : "Add Team Member"}
                  </DialogTitle>
                </DialogHeader>
                <TeamMemberForm
                  member={selectedTeamMember}
                  onSuccess={() => {
                    setIsTeamMemberDialogOpen(false);
                    setSelectedTeamMember(null);
                    queryClient.invalidateQueries({ queryKey: ["team-members"] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamMembersLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-3 w-1/2 mx-auto mb-4" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : teamMembers?.length ? (
              teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">{member.role}</Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTeamMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeamMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {member.image_url && (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                      />
                    )}
                    <h3 className="font-semibold text-center">{member.name}</h3>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground text-center mt-2 line-clamp-3">
                        {member.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No team members yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Partners</h2>
            <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedPartner(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPartner ? "Edit Partner" : "Add Partner"}
                  </DialogTitle>
                </DialogHeader>
                <PartnerForm
                  partner={selectedPartner}
                  onSuccess={() => {
                    setIsPartnerDialogOpen(false);
                    setSelectedPartner(null);
                    queryClient.invalidateQueries({ queryKey: ["partners"] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {partnersLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-16 rounded mx-auto mb-4" />
                    <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-3 w-1/2 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : partners?.length ? (
              partners.map((partner) => (
                <Card key={partner.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">Order: {partner.sort_order}</Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPartner(partner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePartner(partner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {partner.logo_url && (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="w-16 h-16 rounded mx-auto mb-4 object-contain"
                      />
                    )}
                    <h3 className="font-semibold text-center text-sm">{partner.name}</h3>
                    {partner.website_url && (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline block text-center mt-2"
                      >
                        Visit Website
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No partners yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}