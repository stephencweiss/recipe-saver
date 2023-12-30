export const CollapsibleSection = ({
  title,
  HeaderLevel = "h2",
  children,
}: React.PropsWithChildren<{
  title: string;
  HeaderLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}>) => {
  return (
    // Open by default
    <details open className="group my-2">
      <summary className="flex justify-between cursor-pointer list-none items-center gap-4">
        <div className="flex gap-2 items-center">
          {/* <!-- notice here, we added our own triangle/arrow svg --> */}
          <svg
            className="
            group-open:-rotate-180
            rotate-0 transform text-blue-700 transition-all duration-300"
            fill="none"
            height="20"
            width="20"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <HeaderLevel className="text-xl font-bold py-4">{title}</HeaderLevel>
        </div>
      </summary>
      {children}
    </details>
  );
};
