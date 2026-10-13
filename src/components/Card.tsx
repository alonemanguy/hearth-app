type Props = { children: React.ReactNode; className?: string };

export function Card({ children, className = '' }: Props) {
  return <div className={`card ${className}`}>{children}</div>;
}

export default Card;