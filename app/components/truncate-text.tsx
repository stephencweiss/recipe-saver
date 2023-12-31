export default function TruncateText({ children}: React.PropsWithChildren<unknown>) {
  return (
    <span className="max-w-full text-ellipsis overflow-hidden whitespace-nowrap">
      {children}
    </span>
  );
}