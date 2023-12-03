interface ListProps {
  title: string;
  items: string[];
  ListType?: "ol" | "ul";
  HeaderLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const List = (props: ListProps) => {
  const { title, items, HeaderLevel = "h2", ListType = "ul" } = props;
  return (
    <>
      <HeaderLevel className="text-xl font-bold py-4">{title}</HeaderLevel>
      {items.length === 0 ? (
        <p className="pb-2">Nothing to see here!</p>
      ) : (
        <ListType>
          {items.map((item) => (
            <li key={item}>
              <p className="pb-2">{item}</p>
            </li>
          ))}
        </ListType>
      )}
    </>
  );
};

export { List };
