import { redirect } from "next/navigation";

/**
 * fret. has no marketing splash — the marketplace is the home page.
 * Landing on / drops you straight into matched inventory.
 */
export default function HomePage() {
  redirect("/browse");
}
