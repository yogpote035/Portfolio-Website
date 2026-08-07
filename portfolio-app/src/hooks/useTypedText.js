import { useEffect, useState } from 'react';

function useTypedText(words, typeSpeed = 100, backSpeed = 70, pause = 1000) {
  const [text, setText] = useState('');

  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId;

    const tick = () => {
      const currentWord = words[wordIndex];

      if (deleting) {
        charIndex -= 1;
        setText(currentWord.slice(0, charIndex));
      } else {
        charIndex += 1;
        setText(currentWord.slice(0, charIndex));
      }

      if (!deleting && charIndex === currentWord.length) {
        deleting = true;
        timeoutId = window.setTimeout(tick, pause);
        return;
      }

      if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }

      timeoutId = window.setTimeout(tick, deleting ? backSpeed : typeSpeed);
    };

    timeoutId = window.setTimeout(tick, typeSpeed);

    return () => window.clearTimeout(timeoutId);
  }, [backSpeed, pause, typeSpeed, words]);

  return text;
}

export default useTypedText;
