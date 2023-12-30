export default function TruncateText({ children}: React.PropsWithChildren<unknown>) {
  return (
    <div className="max-w-full text-ellipsis overflow-hidden whitespace-nowrap">
      {children}
    </div>
  );
}