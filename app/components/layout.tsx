import { LinksFunction } from "@remix-run/node";

import { links as collapsibleLinks } from "./collapsible";
import { Header, links as headerLinks } from "./header";

export const links: LinksFunction = () => [
  ...headerLinks(),
  ...collapsibleLinks(),
];

interface LayoutProps extends React.PropsWithChildren {
  title: string;
}

export default function Layout(props: Readonly<LayoutProps>){
  const { title, children } = props;
  return (
    <div className="flex h-full min-h-screen flex-col">
      <Header title={title}  />
      {children}
      </div>
  )
}