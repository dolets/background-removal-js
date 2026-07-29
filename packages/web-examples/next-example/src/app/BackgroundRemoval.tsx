'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';

const images = [
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk1NTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk1OTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk2MTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682695794816-7b9da18ed470?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk2NDN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686580186-b55d2a91053c?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk2NzN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682695797873-aa4cb6edd613?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk3MDN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686571030-7fa4ea2b96c3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk3MzN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682687972501-1e58ab814714?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk3NjN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682687982501-1e58ab814714?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk3OTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686580186-b55d2a91053c?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk4MjN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk4NTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk4ODN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682695797873-aa4cb6edd613?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk5MTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682687982468-4584ff11f88a?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk5NDN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682687982501-1e58ab814714?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk5NzN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686580186-b55d2a91053c?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjk5OTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjEwMjN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686571030-7fa4ea2b96c3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjEwNTN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686572502-1e58ab814714?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjEwODN8fHx8&auto=compress&cs=tinysrgb',
  'https://images.unsplash.com/photo-1682686580186-b55d2a91053c?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fDE2OTYwNjEwOTN8fHx8&auto=compress&cs=tinysrgb',
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
    device: 'cpu' as const,
    output: {
      quality: 0.8,
      format: 'image/png' as const
    }
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
        {caption}
        Processing: {seconds} s
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