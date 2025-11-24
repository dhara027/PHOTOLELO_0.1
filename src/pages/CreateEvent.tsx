import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/api/apiClient';
import { toast } from 'sonner';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    photographer_name: '',
    event_name: '',
    event_location: '',
    event_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/api/event/create', formData, {
        responseType: 'blob', // Handle binary response (QR code PNG)
      });
      
      // Backend returns QR code PNG file
      const qrCodeBlob = response.data;
      
      // Get event UUID from response headers
      const eventUuid = response.headers['x-event-uuid'] || 
                       response.headers['event-uuid'] ||
                       response.headers['x-event-id'];
      
      // Download QR code
      const url = window.URL.createObjectURL(qrCodeBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-qr-${eventUuid || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Event created successfully! QR code downloaded.');
      
      // If UUID found in headers, redirect to upload page
      if (eventUuid) {
        navigate(`/dashboard/event/${eventUuid}/upload-photos`);
      } else {
        // Fallback: Make another call to get UUID (if backend supports it)
        // Or redirect to dashboard
        toast.info('Event created! Please check your events list.');
        navigate('/dashboard');
      }
    } catch (error: any) {
      // If error, try to extract UUID from error response
      if (error.response?.data) {
        // Try to parse if it's a blob
        if (error.response.data instanceof Blob) {
          const text = await error.response.data.text();
          try {
            const jsonData = JSON.parse(text);
            const eventUuid = jsonData.uuid || jsonData.id || jsonData.event_uuid;
            if (eventUuid) {
              toast.success('Event created! Redirecting...');
              navigate(`/dashboard/event/${eventUuid}/upload-photos`);
              return;
            }
          } catch {
            // Not JSON, continue with error
          }
        } else if (typeof error.response.data === 'object') {
          const eventUuid = error.response.data?.uuid || error.response.data?.id || error.response.data?.event_uuid;
          if (eventUuid) {
            toast.success('Event created! Redirecting...');
            navigate(`/dashboard/event/${eventUuid}/upload-photos`);
            return;
          }
        }
      }
      toast.error(error.response?.data?.message || error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Centered Card */}
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Create Event</CardTitle>
              <CardDescription className="text-base">
                Add new event details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photographer Name */}
                <div className="space-y-2">
                  <Label htmlFor="photographer_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Photographer Name
                  </Label>
                  <Input
                    id="photographer_name"
                    name="photographer_name"
                    type="text"
                    placeholder="Enter photographer name"
                    value={formData.photographer_name}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="event_name" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Event Name
                  </Label>
                  <Input
                    id="event_name"
                    name="event_name"
                    type="text"
                    placeholder="Enter event name"
                    value={formData.event_name}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                {/* Event Location */}
                <div className="space-y-2">
                  <Label htmlFor="event_location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Event Location
                  </Label>
                  <Input
                    id="event_location"
                    name="event_location"
                    type="text"
                    placeholder="Enter event location"
                    value={formData.event_location}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <Label htmlFor="event_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Event Date
                  </Label>
                  <Input
                    id="event_date"
                    name="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;

