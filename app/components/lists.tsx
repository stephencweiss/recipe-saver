interface ListProps {
  title: string;
  items: (JSX.Element | string)[];
  ListType?: "ol" | "ul";
  HeaderLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const List = (props: ListProps) => {
  const { title, items, HeaderLevel = "h2", ListType = "ul" } = props;

  return (
    <details open className="[&_svg]:open:-rotate-180 my-2">
      <summary className="flex justify-between cursor-pointer list-none items-center gap-4">
        <div className="flex gap-2 items-center">
          {/* <!-- notice here, we added our own triangle/arrow svg --> */}
          <svg
            className="rotate-0 transform text-blue-700 transition-all duration-300"
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
      {items.length === 0 ? (
        <p className="pb-2">Nothing to see here!</p>
      ) : (
        <ListType>
          {items.map((item) => {
            if (typeof item == "string") {
              return (
                <li key={item}>
                  <p className="pb-2">{item}</p>
                </li>
              );
            }
            return item;
          })}
        </ListType>
      )}
    </details>
  );
};

export { List };
