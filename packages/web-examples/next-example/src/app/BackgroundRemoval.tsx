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
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [showBgSection, setShowBgSection] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // ✅ 修复：添加 canvasRef

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
      setProcessedBlob(null);
      setShowBgSection(false);
      setBackgroundColor('#ffffff');
      setCustomBackground(null);
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
    setShowBgSection(false);
    setBackgroundColor('#ffffff');
    setCustomBackground(null);

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

      setProcessedBlob(blob);
      const resultUrl = URL.createObjectURL(blob);
      setImageUrl(resultUrl);
      setCaption('Processing complete!');
      setProgress(100);
      setShowBgSection(true);
    } catch (e) {
      console.error(e);
      setCaption('Processing failed. Check console for details.');
      setProgress(0);
    } finally {
      setIsRunning(false);
    }
  };

  // ✅ 保存图片
  const handleSave = () => {
    if (!imageUrl) {
      setCaption('No image to save.');
      return;
    }

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `background-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCaption('Image saved!');
  };

  // ✅ 上传自定义背景图
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setCustomBackground(url);
      setBackgroundColor('#ffffff'); // 重置纯色
      setCaption('Custom background selected. Click "Apply Background" to see result.');
    };
    reader.readAsDataURL(file);
  };

  // ✅ 合成背景
  const compositeWithBackground = async () => {
    if (!processedBlob) {
      setCaption('Please process an image first.');
      return;
    }

    setIsRunning(true);
    setCaption('Applying background...');

    try {
      const img = new window.Image();
      img.src = URL.createObjectURL(processedBlob);
      await img.decode();

      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      // 绘制背景
      if (customBackground) {
        const bgImg = new window.Image();
        bgImg.src = customBackground;
        await bgImg.decode();
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 绘制前景（抠好的图）
      ctx.drawImage(img, 0, 0);

      // 转换为 Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setCaption('Background replaced!');
    } catch (e) {
      console.error(e);
      setCaption('Failed to apply background.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Background Removal Demo</h1>

      {/* 隐藏的 Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 上传和保存按钮 */}
      <div style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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

        {imageUrl && (
          <button
            onClick={handleSave}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Save Image
          </button>
        )}
      </div>

      {/* 图片展示 */}
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
          <p style={{ color: '#666' }}>No image loaded yet.
        )}
      </div>

      {/* 状态和进度 */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <p style={{ fontWeight: 'bold' }}>{caption}
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
          <p style={{ color: 'green' }}>Processing complete! ({seconds}s)
        )}
      </div>

      {/* 处理按钮 */}
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

      {/* 背景替换区域（处理完成后显示） */}
      {showBgSection && processedBlob && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <h3 style={{ textAlign: 'center', marginTop: 0 }}>Replace Background</h3>

          {/* 纯色背景选择 */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>Choose a color:
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000', '#808080'].map(
                (color) => (
                  <div
                    key={color}
                    onClick={() => {
                      setBackgroundColor(color);
                      setCustomBackground(null);
                    }}
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: color,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: backgroundColor === color && !customBackground ? '3px solid #333' : '2px solid transparent',
                      display: 'inline-block',
                    }}
                  />
                )
              )}
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  setCustomBackground(null);
                }}
                style={{ width: '30px', height: '30px', cursor: 'pointer', border: 'none', padding: 0 }}
              />
            </div>
          </div>

          {/* 自定义背景图上传 */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>Or upload a custom background:
            <label
              htmlFor="bg-upload"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6f42c1',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-block',
              }}
            >
              Choose Image
            </label>
            <input
              id="bg-upload"
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* 应用背景按钮 */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={compositeWithBackground}
              disabled={isRunning}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: isRunning ? '#ccc' : '#fd7e14',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
              }}
            >
              {isRunning ? 'Applying...' : 'Apply Background'}
            </button>
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#888', marginTop: '2rem' }}>
        Powered by @imgly/background-removal | Running on CPU mode
      
    </div>
  );
};

export default BackgroundRemoval;