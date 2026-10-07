import Loader from "./Loader";

export interface FullPageLoaderProps {
  hide?: boolean;
}

/**
 * `Loader` covers its own width but doesn't center or size itself to the
 * viewport - useful inline, not as a standalone loading screen. This wraps
 * it in a fixed, full-viewport overlay with the bar centered, for the "whole
 * page is just waiting" case (e.g. a slow redirect after a user action).
 */
export default function FullPageLoader({ hide }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-vc-back">
      <div className="w-48">
        <Loader full hide={hide} />
      </div>
    </div>
  );
}
