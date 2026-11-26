import type { Metadata } from "next";
import { SpaceShootaPlayer } from "./SpaceShootaPlayer";

export const metadata: Metadata = {
  title: "Space Shoota — Zagraj w przeglądarce | Baluniak.com",
  description:
    "Zagraj w Space Shoota — arkadową kosmiczną strzelankę 3D stworzoną w Godot Engine. Wersja demo prosto w przeglądarce.",
  alternates: {
    canonical: "https://baluniak.com/spaceshoota",
  },
  openGraph: {
    title: "Space Shoota — Zagraj w przeglądarce | Baluniak.com",
    description:
      "Zagraj w Space Shoota — arkadową kosmiczną strzelankę 3D stworzoną w Godot Engine. Wersja demo prosto w przeglądarce.",
    url: "https://baluniak.com/spaceshoota",
    type: "website",
  },
};

export default function SpaceShootaPage() {
  return <SpaceShootaPlayer />;
}
