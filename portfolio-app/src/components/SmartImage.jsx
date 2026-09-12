import { useEffect, useState } from 'react';

function optimizeImageUrl(value) {
  if (!value?.includes('res.cloudinary.com') || !value.includes('/upload/')) return value;
  return value.replace('/upload/', '/upload/f_auto,q_auto,dpr_auto/');
}

function SmartImage({ src, alt, className = '', fallbackLabel, fallbackText, eager = false }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`image-fallback ${className}`.trim()} role="img" aria-label={`${alt} image unavailable`}>
        <span>{String(fallbackLabel || fallbackText || 'YP').slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      className={`${className} ${loaded ? 'is-loaded' : 'is-loading'}`.trim()}
      src={optimizeImageUrl(src)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}

export default SmartImage;
