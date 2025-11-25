import React, { useRef, useState, useEffect } from "react";

const GuestMatch = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [matchedPhotos, setMatchedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventUUID, setEventUUID] = useState<string>("");

  const API_BASE = "http://localhost:5000/api/face";

  // ---------------------------- LOAD EVENT UUID ----------------------------
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const uuid = parts[2]; // /guest/<uuid>
    setEventUUID(uuid);
  }, []);

  // ---------------------------- OPEN CAMERA ----------------------------
  useEffect(() => {
    (async () => {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Camera error:", err);
        }
      }
    })();
  }, []);

  // ---------------------------- CAPTURE SELFIE ----------------------------
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL("image/jpeg");

    setCapturedImage(dataURL);
  };

  // ---------------------------- UPLOAD & MATCH ----------------------------
  const uploadSelfie = async () => {
    if (!capturedImage) return;
    setLoading(true);

    try {
      const blob = await fetch(capturedImage).then((r) => r.blob());

      const formData = new FormData();
      formData.append("event_uuid", eventUUID);
      formData.append("file", blob, "selfie.jpg");

      const res = await fetch(`${API_BASE}/upload-selfie`, {
        method: "POST",
        body: formData,
      });

      if (res.status === 404) {
        setMatchedPhotos([]);
        alert("No matching photos found.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMatchedPhotos(data.matched_photos || []);
    } catch (err) {
      console.error("Upload error:", err);
    }

    setLoading(false);
  };

  // ---------------------------- DOWNLOAD MATCHED PHOTOS ----------------------------
  const downloadAll = async () => {
    if (matchedPhotos.length === 0) return;

    const encoded = encodeURIComponent(matchedPhotos.join(","));
    const url = `${API_BASE}/download-matched-photos?urls=${encoded}`;

    window.open(url, "_blank");
  };

  // ---------------------------- UI ----------------------------
  return (
    <div className="p-4 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Find Your Photos</h1>

      {!capturedImage ? (
        <>
          <video ref={videoRef} autoPlay className="w-full rounded shadow" />
          <button
            onClick={capturePhoto}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Capture Selfie
          </button>
        </>
      ) : (
        <>
          <img
            src={capturedImage}
            alt="Selfie"
            className="w-full rounded shadow"
          />
          <button
            onClick={uploadSelfie}
            disabled={loading}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Matching..." : "Find My Photos"}
          </button>

          <button
            onClick={() => setCapturedImage(null)}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Retake Selfie
          </button>
        </>
      )}

      {/* RESULTS */}
      {matchedPhotos.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">
            Your Matching Photos ({matchedPhotos.length})
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {matchedPhotos.map((src, i) => (
              <img
                key={i}
                src={src}
                className="rounded shadow border"
                alt="match"
              />
            ))}
          </div>

          <button
            onClick={downloadAll}
            className="mt-4 bg-purple-700 text-white px-4 py-2 rounded"
          >
            Download All
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default GuestMatch;
