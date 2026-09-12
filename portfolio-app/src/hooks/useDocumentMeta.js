import { useEffect } from 'react';

function setMeta(name, content, property = false) {
  if (!content) return;
  const attribute = property ? 'property' : 'name';
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function useDocumentMeta({ title, description, image, canonicalPath = '/', structuredData }) {
  useEffect(() => {
    const fullTitle = title || 'Yogesh Pote | MERN Stack Developer';
    const canonicalUrl = new URL(canonicalPath, window.location.origin).toString();
    document.title = fullTitle;
    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:image', image, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const scriptId = 'page-structured-data';
    let script = document.getElementById(scriptId);
    if (structuredData) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } else {
      script?.remove();
    }
  }, [canonicalPath, description, image, structuredData, title]);
}

export default useDocumentMeta;
