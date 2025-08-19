import React, { useEffect, useRef } from 'react';

interface OutsideElementEventProps {
  className?: string;
  children: React.ReactNode;
  onOutsideEvent: (event: MouseEvent | TouchEvent) => void;
  style?: React.CSSProperties;
}

const OutsideElementEvent: React.FC<OutsideElementEventProps> = ({ className, children, onOutsideEvent, style }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Don't call on the same frame as first render
  const [isReady, setIsReady] = React.useState(false);
  React.useEffect(() => {
    setIsReady(true);
  }, []);

  const handleOutsideEvent = (event) => {
    if (!isReady) return;
    
    if (event.target.hasAttribute('data-detector-ignore-navigation')) {
      return;
    }

    if (ref.current && !ref.current.contains(event.target)) {
      onOutsideEvent(event);
      return;
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideEvent);
    document.addEventListener('touchstart', handleOutsideEvent);

    return () => {
      document.removeEventListener('mousedown', handleOutsideEvent);
      document.removeEventListener('touchstart', handleOutsideEvent);
    };
  }, [isReady]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default OutsideElementEvent;
