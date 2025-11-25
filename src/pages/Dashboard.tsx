import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  LogOut,
  Calendar,
  Image,
  Plus,
  Upload,
  User,
  MapPin,
  QrCode,
  Download,
  X as Close,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import apiClient from "@/api/apiClient";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface Event {
  id: string;
  uuid?: string;
  name?: string;
  event_name?: string;
  photographer_name?: string;
  event_location?: string;
  event_date?: string;
  description?: string;
  photo_count?: number;
  photos_count?: number;
  total_photos?: number;
  photoCount?: number;
  [key: string]: any;
}

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [showQR, setShowQR] = useState(false);
  const [qrEvent, setQrEvent] = useState<Event | null>(null);

  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setTimeout(() => fetchEvents(), 300);
    }
  }, [location.pathname]);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/api/event/list", {
        params: { page: 1, page_size: 10 },
      });

      setEvents(response.data?.events || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const openQR = (eventData: Event) => {
    setQrEvent(eventData);
    setShowQR(true);
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svg)], {
      type: "image/svg+xml",
    });

    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${qrEvent?.event_name || "event"}-qr.svg`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("QR downloaded");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const publicURL = import.meta.env.VITE_PUBLIC_URL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Your events & photos</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/dashboard/create-event")}>
              <Plus className="h-4 w-4 mr-2" /> Create Event
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* EVENTS LIST */}
        <h2 className="text-2xl font-semibold mb-4">Events</h2>

        {loading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No events yet</h3>
              <p className="text-muted-foreground">Your events will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => {
              const eventUuid = event.uuid || event.id;
              const eventName = event.event_name || event.name || `Event ${i + 1}`;
              const qrValue = `${publicURL}/guest/${eventUuid}`;

              return (
                <Card key={event.id} className="relative hover:shadow-xl">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{eventName}</CardTitle>
                        <CardDescription>{event.photographer_name}</CardDescription>
                      </div>

                      {/* QR ICON BUTTON */}
                      <button
                        className="p-2 hover:bg-muted rounded-xl transition"
                        onClick={() => openQR(event)}
                      >
                        <QrCode className="h-6 w-6" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2" /> {event.event_location}
                    </div>

                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />{" "}
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString()
                        : "Not specified"}
                    </div>

                    <div className="flex items-center text-sm">
                      <Image className="h-4 w-4 mr-2" />
                      {(event.photo_count ||
                        event.photos_count ||
                        event.total_photos ||
                        event.photoCount ||
                        0) + " photos"}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() =>
                        navigate(`/dashboard/event/${eventUuid}/upload-photos`)
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" /> Upload Photos
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* QR POPUP */}
      {showQR && qrEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[380px] relative">
            <button
              className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full"
              onClick={() => setShowQR(false)}
            >
              <Close className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-center mb-4">
              {qrEvent.event_name || qrEvent.name}
            </h2>

            <div className="flex justify-center p-4 bg-muted rounded-xl">
              <QRCode
                id="qr-code-svg"
                value={`${publicURL}/guest/${qrEvent.uuid}`}
                size={220}
              />
            </div>

            <Button className="w-full mt-5" onClick={downloadQR}>
              <Download className="h-4 w-4 mr-2" /> Download QR
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
