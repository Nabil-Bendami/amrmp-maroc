import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Calendar, MapPin } from "lucide-react";
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
import { EventForm } from "@/components/admin/EventForm";
import { fetchEvents, createEvent, updateEvent, deleteEvent, type EventRow } from "@/services/content";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events")({
  component: EventsManagement,
});

function EventsManagement() {
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsDialogOpen(false);
      toast.success("Event created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create event: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsDialogOpen(false);
      setSelectedEvent(null);
      toast.success("Event updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update event: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete event: " + error.message);
    },
  });

  const handleCreateEvent = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdateEvent = (data: any) => {
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data });
    }
  };

  const handleDeleteEvent = (event: EventRow) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(event.id);
    }
  };

  const openEditDialog = (event: EventRow) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Manage your events and publications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <EventForm
              event={selectedEvent || undefined}
              onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title_fr}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title_fr}</CardTitle>
                    {event.title_ar && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.title_ar}
                      </p>
                    )}
                  </div>
                  <Badge variant={event.is_published ? "default" : "secondary"}>
                    {event.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.summary_fr && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.summary_fr}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {event.event_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(event)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEvent(event)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first event.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Event
          </Button>
        </div>
      )}
    </div>
  );
}