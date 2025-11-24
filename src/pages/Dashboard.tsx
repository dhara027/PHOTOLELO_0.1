import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Calendar, Image, Plus, Upload, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/api/apiClient';
import { toast } from 'sonner';

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
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If not authenticated, don't render (ProtectedRoute will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Refresh when navigating back to dashboard
  useEffect(() => {
    const handleRouteChange = () => {
      if (location.pathname === '/dashboard') {
        // Small delay to ensure navigation is complete
        setTimeout(() => {
          fetchEvents();
        }, 300);
      }
    };
    
    handleRouteChange();
  }, [location.pathname]);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get('/api/event/list', {
        params: {
          page: 1,
          page_size: 10,
        },
      });
      
      // Backend returns: {events: Array, page: number, page_size: number, total_count: number, total_pages: number}
      const eventsData = response.data?.events || [];
      
      // Debug: Log to see actual response structure
      console.log('Events API Response:', response.data);
      console.log('First Event:', eventsData[0]);
      
      setEvents(eventsData);
      setLoading(false);
    } catch (error: any) {
      // If 401 error, token is invalid - ProtectedRoute will handle redirect
      if (error.response?.status === 401) {
        setLoading(false);
        return;
      }
      toast.error(error.response?.data?.message || error.message || 'Failed to load events');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Your events and photos</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/dashboard/create-event')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Events List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Events</h2>
          {loading ? (
            <div className="text-center py-12">Loading events...</div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground">Events will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => {
                const eventUuid = event.uuid || event.id;
                const eventName = event.event_name || event.name || `Event ${index + 1}`;
                const photographerName = event.photographer_name || 'Unknown';
                const eventLocation = event.event_location || 'Not specified';
                const eventDate = event.event_date 
                  ? new Date(event.event_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'Not specified';
                
                return (
                  <Card key={event.id || index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{eventName}</CardTitle>
                      <CardDescription className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3" />
                          <span>{photographerName}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Event Location */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{eventLocation}</span>
                      </div>
                      
                      {/* Event Date */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{eventDate}</span>
                      </div>
                      
                      {/* Photo Count */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Image className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          {event.photo_count || 
                           event.photos_count || 
                           event.total_photos || 
                           event.photoCount || 
                           0} photos
                        </span>
                      </div>
                      
                      {/* Upload Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => navigate(`/dashboard/event/${eventUuid}/upload-photos`)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photos
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
