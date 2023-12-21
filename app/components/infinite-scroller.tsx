import { useCallback, useEffect, useRef } from "react";

// Define a function type with generic parameters
type Func = (...args: unknown[]) => void;
function debounce<F extends Func>(func: F, wait: number): F {
  let timeoutId: NodeJS.Timeout | null;

  return function(this: ThisParameterType<F>, ...args: Parameters<F>) {

    const later = () => {
      timeoutId = null;
      func.apply(this, args);
    };

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(later, wait);
  } as F;
}


interface InfiniteScrollerProps {
  children: React.ReactNode;
  loading: boolean;
  loadNext: () => void;
}
export const InfiniteScroller = (props:InfiniteScrollerProps) => {
  const { children, loading, loadNext } = props;
  const scrollListener = useRef(loadNext);

  useEffect(() => {
    scrollListener.current = loadNext;
  }, [loadNext]);


  useEffect(() => {
    scrollListener.current = loadNext;
  }, [loadNext]);

  const onScroll = useCallback(() => {
    const documentHeight = document.documentElement.scrollHeight;
    const scrollDifference = Math.floor(window.innerHeight + window.scrollY);
    const scrollEnded = documentHeight === scrollDifference;

    if (scrollEnded && !loading) {
      scrollListener.current();
    }
  }, [loading]);

  // Debounce the scroll handler
  const debouncedOnScroll = useRef(debounce(onScroll, 200)).current;

  useEffect(() => {

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", debouncedOnScroll);
    }

    return () => {
      window.removeEventListener("scroll", debouncedOnScroll);
    };
  }, [debouncedOnScroll]);

  return <>{children}</>;
};