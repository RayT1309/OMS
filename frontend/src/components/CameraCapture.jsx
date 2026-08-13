import { useEffect, useRef, useState } from 'react';

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.75;

// Live webcam capture for desktop/laptop browsers, where the native
// <input capture> attribute only opens a file browser rather than the
// camera. Mobile keeps using the native input (real camera, less code).
export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser');
      return undefined;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => setError(err.message || 'Could not access camera'));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    let { videoWidth: width, videoHeight: height } = video;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

    stopStream();
    onCapture(dataUrl);
  };

  const handleCancel = () => {
    stopStream();
    onCancel();
  };

  return (
    <div className="camera-capture">
      {error ? (
        <p className="form-error">{error}</p>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
      )}
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
        {!error && (
          <button type="button" className="btn-primary" onClick={handleCapture}>Capture</button>
        )}
      </div>
    </div>
  );
}
