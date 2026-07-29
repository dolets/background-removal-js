'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';

const images = [
  'https://images.unsplash.com/photo-1656408308602-05835d990fb1?q=80&w=3200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1686002359940-6a51b0d64f68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
  'https://images.unsplash.com/photo-1590523278191-995cbcda646b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9',
  'https://images.unsplash.com/photo-1709248835088-03bb0946d6ab?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

const BackgroundRemoval = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState('0');
  const [startDate, setStartDate] = useState(Date.now());
  const [caption, setCaption] = useState('Click me to remove background');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = {
    debug: false,
    progress: (key: string, current: number, total: number) => {
      const [type, subtype] = key.split(':');
      setCaption(`${type} ${subtype} ${((current / total) * 100).toFixed(0)}%`);
    },
    rescale: true,
    device: 'gpu' as const,
    output: { quality: 0.8, format: 'image/png' as const }
  };

  const diff = (start: number, end: number) =>
    ((end - start) / 1000).toFixed(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const imageParam = params.get('image');
    const auto = params.get('auto');
    const randomImage = imageParam || images[Math.floor(Math.random() * images.length)];
    setImageUrl(randomImage);

    (async () => {
      try {
        const imgly = await import('@imgly/background-removal');
        const mod = (imgly as any).default ?? imgly;
        await mod.preload();
        console.log('preload ok');
        if (auto) handleLoad('remove');
      } catch (e) {
        console.error('preload failed', e);
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

  const handleLoad = async (type: string) => {
    const params = new URLSearchParams(window.location.search);
    const randomImage =
      params.get('image') || images[Math.floor(Math.random() * images.length)];

    setIsRunning(true);
    setStartDate(Date.now());
    setSeconds('0');
    setImageUrl(randomImage);

    try {
      const imgly = await import('@imgly/background-removal');
      const mod = (imgly as any).default ?? imgly;

      let blob: Blob;
      if (type === 'remove') {
        blob = await mod.removeBackground(randomImage, config);
      } else {
        const mask = await mod.segmentForeground(randomImage, config);
        blob = await mod.applySegmentationMask(randomImage, mask, config);
      }
      setImageUrl(URL.createObjectURL(blob));
      setCaption('Processing complete!');
    } catch (e) {
      console.error(e);
      setCaption('Processing failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div id="app">
      <header>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {imageUrl && <img src={imageUrl} alt="result" />}
        <p>{caption}</p>
        <p>Processing: {seconds} s</p>
        <button disabled={isRunning} onClick={() => handleLoad('remove')}>
          Click me (removeBackground)
        </button>
        <button disabled={isRunning} onClick={() => handleLoad('segment')}>
          Click me (applySegmentationMask)
        </button>
      </header>
    </div>
  );
};

export default BackgroundRemoval;
