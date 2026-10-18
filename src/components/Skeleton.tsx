import type { CSSProperties } from 'react';

type Props = {
  width?: number | string;
  height: number | string;
  radius?: number | string;
};

type SkeletonStyle = CSSProperties & {
  '--skeleton-width'?: number | string;
  '--skeleton-height': number | string;
  '--skeleton-radius'?: number | string;
};

const toCssLength = (value: number | string): string =>
  typeof value === 'number' ? `${value}px` : value;

export function Skeleton({ width, height, radius }: Props) {
  const style: SkeletonStyle = {
    '--skeleton-width': width === undefined ? undefined : toCssLength(width),
    '--skeleton-height': toCssLength(height),
    '--skeleton-radius': radius === undefined ? undefined : toCssLength(radius),
  };

  return <span aria-hidden="true" className="skeleton" style={style} />;
}

export default Skeleton;
