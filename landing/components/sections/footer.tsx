import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";

interface Icon {
  icon: JSX.Element;
  url: string;
}

const icons: Icon[] = [];

type Link = {
  text: string;
  url: string;
};

const links: Link[] = [
  { text: "Contact", url: "mailto:admin@memichat.com" },
  { text: "Privacy Policy", url: "/privacy" },
  { text: "Terms of Service", url: "/terms" },
];

export function Footer() {
  return (
    <footer className="flex flex-col gap-y-5 rounded-lg px-7 py-5 md:px-10 container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Icons.logo className="h-5 w-5" />
          <h2 className="text-lg font-bold text-foreground">
            {siteConfig.name}
          </h2>
        </div>

        <div className="flex gap-x-2">
          {icons.map((icon, index) => (
            <a
              key={index}
              href={icon.url}
              className="flex h-5 w-5 items-center justify-center text-muted-foreground transition-all duration-100 ease-linear hover:text-foreground hover:underline hover:underline-offset-4"
            >
              {icon.icon}
            </a>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-between gap-y-5 md:flex-row md:items-center">
        <ul className="flex flex-col gap-x-5 gap-y-2 text-muted-foreground md:flex-row md:items-center">
          {links.map((link, index) => (
            <li
              key={index}
              className="text-[15px]/normal font-medium text-muted-foreground transition-all duration-100 ease-linear hover:text-foreground hover:underline hover:underline-offset-4"
            >
              <a href={link.url}>{link.text}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between text-sm font-medium tracking-tight text-muted-foreground">
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
