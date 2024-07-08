import WalletContainer from "@/components/WalletContainer";
import { plugins } from "@/plugins";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { MobileNavDialog } from "./mobileNavDialog";
import { NavLink, type INavLink } from "./navLink";
import { AvatarIcon, IconType } from "@aragon/ods";
import { PUB_APP_NAME, PUB_PROJECT_LOGO } from "@/constants";

export const Navbar: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  const navLinks: INavLink[] = [
    { path: "/", id: "dashboard", name: "Dashboard", icon: IconType.APP_DASHBOARD },
    ...plugins
      // .filter((p) => !p.hidden)
      .map((p) => ({
        id: p.id,
        name: p.title,
        path: `/plugins/${p.id}/#/`,
        icon: p.icon,
      })),
  ];

  return (
    <>
      <nav className="h-30 sticky top-0 z-[var(--hub-navbar-z-index)] flex w-full items-center justify-center border-b border-b-neutral-100 bg-neutral-0">
        <div className="w-full max-w-[1280px] flex-col gap-2 p-3 md:px-6 md:pb-0 md:pt-5 lg:gap-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex">
              <Link
                href="/"
                className={classNames(
                  "flex items-center gap-x-5 rounded-full py-3 pb-5 md:rounded-lg lg:ml-10",
                  "outline-none focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset" // focus styles
                )}
              >
                <img src={PUB_PROJECT_LOGO} width="164" height="32" className="shrink-0" alt={PUB_APP_NAME + " logo"} />
              </Link>
              <div className="flex items-center gap-x-2 px-4">
                <span className="text-sm leading-tight text-neutral-500">Powered by</span>
                <img src="/logo-aragon-bw-sm.png" width="18" height="18" alt="Aragon" />
              </div>
            </div>

            <div className="flex items-center gap-x-2">
              <div className="shrink-0">
                <WalletContainer />
              </div>

              {/* Nav Trigger */}
              <button
                onClick={() => setShowMenu(true)}
                className={classNames(
                  "rounded-full border border-neutral-100 bg-neutral-0 p-1 md:hidden",
                  "outline-none focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset" // focus styles
                )}
              >
                <AvatarIcon size="lg" icon={IconType.MENU} />
              </button>
            </div>
          </div>

          {/* Tab wrapper */}
          <ul className="hidden gap-x-10 md:flex lg:pl-10">
            {navLinks.map(({ id, name, path }) => (
              <NavLink name={name} path={path} id={id} key={id} />
            ))}
          </ul>
        </div>
      </nav>
      <MobileNavDialog open={showMenu} navLinks={navLinks} onOpenChange={setShowMenu} />
    </>
  );
};
