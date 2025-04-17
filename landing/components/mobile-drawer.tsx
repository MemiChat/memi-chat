import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu } from "lucide-react";

export function MobileDrawer() {
  return (
    <Drawer>
      <DrawerTrigger>
        <Menu className="text-2xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6">
          <div className="">
            <Link
              href="/"
              title="brand-logo"
              className="relative mr-6 flex items-center space-x-2"
            >
              <Icons.logo className="w-auto h-[40px]" />
              <span className="font-bold text-xl">{siteConfig.name}</span>
            </Link>
          </div>
        </DrawerHeader>
        <DrawerFooter>
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "default" }),
              "text-white rounded-full group"
            )}
          >
            {siteConfig.cta}
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
