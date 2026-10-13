import type { ReactNode } from 'react';
import Button from './Button';

type Props = {
  icon: ReactNode;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export function EmptyState({ icon, title, body, ctaLabel, onCta }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h2 className="empty-title">{title}</h2>
      <p className="empty-body">{body}</p>
      {ctaLabel && onCta && (
        <div className="empty-cta">
          <Button onClick={onCta}>{ctaLabel}</Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
