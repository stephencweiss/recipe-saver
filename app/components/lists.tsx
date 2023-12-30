import { CollapsibleSection } from "./collapsible";

interface ListProps {
  title: string;
  items: (React.ReactNode | string)[];
  ListType?: "ol" | "ul";
  HeaderLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const List = (props: ListProps) => {
  const { title, items, HeaderLevel, ListType = "ul" } = props;

  return (
    <CollapsibleSection title={title} HeaderLevel={HeaderLevel}>
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
    </CollapsibleSection>
  );
};

export { List };
