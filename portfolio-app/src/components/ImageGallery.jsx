import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SmartImage from './SmartImage.jsx';

function ImageGallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const isOpen = activeIndex !== null;
  const changeImage = (direction) => setActiveIndex((current) => (current + direction + images.length) % images.length);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowLeft') changeImage(-1);
      if (event.key === 'ArrowRight') changeImage(1);
      if (event.key === 'Tab') {
        const controls = dialogRef.current?.querySelectorAll('button');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, images.length]);

  return <>
    <div className="gallery-grid">{images.map((image, index) => <button className="gallery-item" key={`${image}-${index}`} onClick={(event) => { triggerRef.current = event.currentTarget; setActiveIndex(index); }} type="button" aria-label={`Open ${title} screenshot ${index + 1}`}><SmartImage src={image} alt={`${title} screen ${index + 1}`} /><span>View image <i className="bx bx-expand-alt" /></span></button>)}</div>
    {createPortal(<AnimatePresence>{isOpen && <motion.div ref={dialogRef} className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${title} image viewer`} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && setActiveIndex(null)}>
      <div className="lightbox-toolbar"><span aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span><button ref={closeButtonRef} type="button" onClick={() => setActiveIndex(null)} aria-label="Close image viewer"><i className="bx bx-x" /></button></div>
      <button className="lightbox-arrow previous" type="button" onClick={() => changeImage(-1)} aria-label="Previous image"><i className="bx bx-left-arrow-alt" /></button>
      <div className="lightbox-stage"><AnimatePresence mode="wait" initial={false}><motion.div className="lightbox-image" key={activeIndex} initial={reduceMotion ? false : { opacity: 0, x: 35, scale: .98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -35, scale: .98 }} transition={{ duration: .28, ease: 'easeOut' }}><SmartImage src={images[activeIndex]} alt={`${title} screen ${activeIndex + 1}`} eager /></motion.div></AnimatePresence></div>
      <button className="lightbox-arrow next" type="button" onClick={() => changeImage(1)} aria-label="Next image"><i className="bx bx-right-arrow-alt" /></button><p className="lightbox-caption">{title} · Screen {activeIndex + 1}</p>
    </motion.div>}</AnimatePresence>, document.body)}
  </>;
}
export default ImageGallery;
