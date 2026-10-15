import { HTMLAttributes, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = '', ...rest }: Props) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export default Card;