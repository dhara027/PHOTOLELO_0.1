import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Download, Trash2, ArrowLeft, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PhotoGrid } from '@/components/PhotoGrid';
import { FileUploader } from '@/components/FileUploader';
import apiClient from '@/api/apiClient';
import { toast } from 'sonner';

interface Photo {
  id: string;
  url: string;
  thumbUrl?: string;
  filename?: string;
  metadata?: {
    uploadedBy?: string;
    createdAt?: string;
  };
}

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchPhotos();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      setEventName(response.data.name);
      setEventCode(response.data.code);
    } catch (error) {
      toast.error('Failed to load event details');
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await apiClient.get(`/events/${eventId}/photos`);
      setPhotos(response.data);
    } catch (error) {
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      await apiClient.post(`/events/${eventId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo uploaded successfully!');
      setUploadDialogOpen(false);
      fetchPhotos();
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoIds: string[]) => {
    try {
      await Promise.all(photoIds.map((id) => apiClient.delete(`/photos/${id}`)));
      toast.success(`${photoIds.length} photo(s) deleted`);
      fetchPhotos();
    } catch (error) {
      toast.error('Failed to delete photos');
    }
  };

  const handleDownload = async (photoIds: string[]) => {
    try {
      for (const id of photoIds) {
        const response = await apiClient.get(`/photos/${id}/download`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `photo-${id}.jpg`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download photos');
    }
  };

  const guestUrl = `${window.location.origin}/guest/${eventCode}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{eventName}</h1>
          <p className="text-muted-foreground">
            Event Code: <span className="font-mono font-semibold">{eventCode}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Guest Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Guest Access Link</DialogTitle>
                <DialogDescription>Share this link with guests to match their photos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg break-all font-mono text-sm">
                  {guestUrl}
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(guestUrl);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="w-full"
                >
                  Copy Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Photos</DialogTitle>
                <DialogDescription>Add photos to this event</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              {uploading && <p className="text-sm text-muted-foreground text-center">Uploading...</p>}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading photos...</div>
      ) : (
        <PhotoGrid
          photos={photos}
          onDelete={handleDelete}
          onDownload={handleDownload}
          selectable={true}
        />
      )}
    </div>
  );
};

export default EventDetail;
