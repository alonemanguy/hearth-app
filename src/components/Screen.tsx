type Props = { children: React.ReactNode };

export function Screen({ children }: Props) {
  return <div className="screen">{children}</div>;
}

export default Screen;