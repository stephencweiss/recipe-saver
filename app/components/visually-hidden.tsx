import React, { useEffect, useState, ReactNode } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
}

const inLineStyles = {
  clipPath: 'path(0,0)',
  height: 1,
  width: 1,
  margin: -1,
  padding: 0,
  border: 0,
}

const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, ...delegated }) => {
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const handleKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === 'Alt') {
          setForceShow(true);
        }
      };
      const handleKeyUp = (ev: KeyboardEvent) => {
        if (ev.key === 'Alt') {
          setForceShow(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, []);

  if (forceShow) {
    return <>{children}</>;
  }

  return (
    <span
      className="inline-block absolute overflow-hidden"
      style={inLineStyles}
      {...delegated}
    >
      {children}
    </span>
  );
};

export default VisuallyHidden;
