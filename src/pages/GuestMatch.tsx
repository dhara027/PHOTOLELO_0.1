import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/FileUploader';
import { MatchResult } from '@/components/MatchResult';
import { useSocket } from '@/hooks/useSocket';
import apiClient from '@/api/apiClient';
import { toast } from 'sonner';

type MatchStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

interface Match {
  photoId: string;
  url: string;
  thumbUrl?: string;
  confidence: number;
}

const GuestMatch = () => {
  const { eventCode } = useParams();
  const { socket, connected } = useSocket();
  const [status, setStatus] = useState<MatchStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [downloadZipUrl, setDownloadZipUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !requestId) return;

    socket.on('match_progress', (data: { requestId: string; step: string; percent: number }) => {
      if (data.requestId === requestId) {
        setProgress(data.percent);
      }
    });

    socket.on('match_result', (data: { requestId: string; matches: Match[] }) => {
      if (data.requestId === requestId) {
        setMatches(data.matches);
        setStatus('complete');
        toast.success(`Found ${data.matches.length} matches!`);
      }
    });

    return () => {
      socket.off('match_progress');
      socket.off('match_result');
    };
  }, [socket, requestId]);

  const handleFileSelect = async (file: File) => {
    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file); // Changed from 'selfie' to 'file'
    formData.append('event_uuid', eventCode || ''); // Changed from 'eventCode' to 'event_uuid'

    try {
      const response = await apiClient.post('/api/face/upload-selfie', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Response contains: matched_photos and download_zip_url
      const { matched_photos, download_zip_url } = response.data;
      
      if (matched_photos && Array.isArray(matched_photos)) {
        // Convert matched_photos to Match format
        const matches: Match[] = matched_photos.map((photo: any, index: number) => ({
          photoId: photo.id || photo.photo_id || `match-${index}`,
          url: photo.url || photo.photo_url || photo,
          thumbUrl: photo.thumb_url || photo.thumbnail || photo.url || photo.photo_url || photo,
          confidence: photo.confidence || photo.match_score || 0.95,
        }));
        
        setMatches(matches);
        setStatus('complete');
        toast.success(`Found ${matches.length} matches!`);
        
        // Store download_zip_url for download button
        if (download_zip_url) {
          setDownloadZipUrl(download_zip_url);
        }
      } else {
        toast.error('No matches found or invalid response format');
        setStatus('error');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to start matching');
      setStatus('error');
    }
  };

  const pollMatchResult = async (reqId: string) => {
    const maxAttempts = 22; // 45 seconds with 2s intervals
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      
      try {
        const response = await apiClient.get(`/match/${reqId}`);
        const { status: matchStatus, matches: resultMatches } = response.data;

        if (matchStatus === 'done') {
          clearInterval(poll);
          setMatches(resultMatches);
          setStatus('complete');
          toast.success(`Found ${resultMatches.length} matches!`);
        } else if (matchStatus === 'processing') {
          setProgress(Math.min(95, (attempts / maxAttempts) * 100));
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setStatus('error');
          toast.error('Matching timed out. Please try again.');
        }
      } catch (error) {
        clearInterval(poll);
        setStatus('error');
        toast.error('Failed to get match results');
      }
    }, 2000);
  };

  const handleDownload = async (photoId: string) => {
    try {
      const response = await apiClient.get(`/photos/${photoId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `photo-${photoId}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download photo');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setProgress(0);
    setRequestId(null);
    setMatches([]);
    setDownloadZipUrl(null);
  };

  const handleDownloadZip = () => {
    if (downloadZipUrl) {
      window.open(downloadZipUrl, '_blank');
      toast.success('Download started');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Photos</h1>
          <p className="text-muted-foreground">
            Upload a selfie and we'll find all your event photos
          </p>
          {eventCode && (
            <p className="text-sm text-muted-foreground mt-2">
              Event: <span className="font-mono font-semibold">{eventCode}</span>
            </p>
          )}
        </div>

        {status === 'idle' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Upload Your Selfie</CardTitle>
              <CardDescription>
                Take a clear photo of your face for the best results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader onFileSelect={handleFileSelect} allowCamera={true} />
            </CardContent>
          </Card>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {status === 'uploading' ? 'Uploading...' : 'Finding Matches...'}
              </h3>
              <p className="text-muted-foreground mb-4">
                This may take a moment
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
            </CardContent>
          </Card>
        )}

        {status === 'complete' && (
          <div>
            <MatchResult
              matches={matches}
              onDownload={handleDownload}
            />
            <div className="text-center mt-8 space-y-4">
              {downloadZipUrl && (
                <div>
                  <button
                    onClick={handleDownloadZip}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Download All Photos (ZIP)
                  </button>
                </div>
              )}
              <button
                onClick={handleReset}
                className="text-accent hover:underline block"
              >
                Try another photo
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-semibold mb-2 text-destructive">
                Something went wrong
              </h3>
              <p className="text-muted-foreground mb-4">
                Please try again
              </p>
              <button
                onClick={handleReset}
                className="text-accent hover:underline"
              >
                Start over
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuestMatch;
