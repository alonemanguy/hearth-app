import { useEffect } from 'react';

type Props = {
  message: string;
  visible: boolean;
  onHide: () => void;
};

export function Toast({ message, visible, onHide }: Props) {
  useEffect(() => {
    if (!visible) return;

    const timeout = window.setTimeout(onHide, 2500);
    return () => window.clearTimeout(timeout);
  }, [onHide, visible]);

  if (!visible) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export default Toast;
