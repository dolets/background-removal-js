'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const images = [
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk1NTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk1OTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk1OTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk1OTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682695794816-7b9da18ed470?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk1OTN8fHx8&auto=compress&cs=tinysrgb',
];

const BackgroundRemoval = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState('0');
  const [startDate, setStartDate] = useState(Date.now());
  const [caption, setCaption] = useState('Click "Upload Image" to start');
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = {
    debug: false,
    progress: (key: string, current: number, total: number) => {
      const percent = Math.round((current / total) * 100);
      setProgress(percent);
      const [type, subtype] = key.split(':');
      setCaption(`${type} ${subtype} ${percent}%`);
    },
    rescale: true,
    device: 'cpu' as const,
    output: {
      quality: 0.8,
      format: 'image/png' as const,
    },
  };

  const diff = (start: number, end: number) =>
    ((end - start) / 1000).toFixed(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const imageParam = params.get('image');
    const auto = params.get('auto');
    const randomImage = imageParam || images[Math.floor(Math.random() * images.length)];
    setImageUrl(randomImage);
    setOriginalImage(randomImage);

    (async () => {
      try {
        const imgly = await import('@imgly/background-removal');
        const mod = (imgly as any).default ?? imgly;
        await mod.preload();
        console.log('preload ok');
        if (auto) handleLoad('remove');
      } catch (e) {
        console.error('preload failed', e);
        setCaption('Preload failed. Please refresh.');
      }
    })();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(diff(startDate, Date.now()));
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, startDate]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImageUrl(url);
      setOriginalImage(url);
      setCaption('Image uploaded. Click a button to process.');
      setProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const handleLoad = async (type: string) => {
    if (!originalImage) {
      setCaption('Please upload an image first.');
      return;
    }

    setIsRunning(true);
    setStartDate(Date.now());
    setSeconds('0');
    setImageUrl(originalImage);
    setProgress(0);
    setCaption('Starting...');

    try {
      const imgly = await import('@imgly/background-removal');
      const mod = (imgly as any).default ?? imgly;

      let blob: Blob;
      if (type === 'remove') {
        blob = await mod.removeBackground(originalImage, config);
      } else {
        const mask = await mod.segmentForeground(originalImage, config);
        blob = await mod.applySegmentationMask(originalImage, mask, config);
      }

      const resultUrl = URL.createObjectURL(blob);
      setImageUrl(resultUrl);
      setCaption('Processing complete!');
      setProgress(100);
    } catch (e) {
      console.error(e);
      setCaption('Processing failed. Check console for details.');
      setProgress(0);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Background Removal Demo</h1>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <label
          htmlFor="upload"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          Upload Image
        </label>
        <input
          id="upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div
        style={{
          textAlign: 'center',
          margin: '2rem 0',
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Result"
            width={500}
            height={500}
            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}
          />
        ) : (
          <p style={{ color: '#666' }}>No image loaded yet.</p>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <p style={{ fontWeight: 'bold' }}>{caption}</p>
        {isRunning && (
          <div
            style={{
              width: '100%',
              backgroundColor: '#eee',
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '10px',
                backgroundColor: '#0070f3',
                transition: 'width 0.2s',
              }}
            />
          </div>
        )}
        {!isRunning && progress > 0 && (
          <p style={{ color: 'green' }}>Processing complete! ({seconds}s)</p>
        )}
      </div>

      <div
        style={{
          textAlign: 'center',
          gap: '1rem',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          disabled={isRunning || !originalImage}
          onClick={() => handleLoad('remove')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isRunning ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {isRunning ? 'Processing...' : 'Remove Background'}
        </button>

        <button
          disabled={isRunning || !originalImage}
          onClick={() => handleLoad('segment')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isRunning ? '#ccc' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {isRunning ? 'Processing...' : 'Apply Segmentation Mask'}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#888', marginTop: '2rem' }}>
        Powered by @imgly/background-removal | Running on CPU mode
      </p>
    </div>
  );
};

export default BackgroundRemoval;