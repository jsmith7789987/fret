import Link from "next/link";
import { ArrowRight } from "@/components/ui/ArrowRight";
import type { Category } from "@/lib/categories";
import { formatCount } from "@/lib/categories";

/**
 * A large image led category tile.
 *
 * Portrait image, a scrim at the foot so white type stays readable over any
 * photograph, serif title, count in small caps, arrow bottom right. Until a
 * category has a real photograph it renders the gradient placeholder from the
 * category definition. Nothing is fetched over the network for the fallback.
 */
export function CategoryTile({
  category,
  count,
  image,
}: {
  category: Category;
  count?: number | null;
  image?: string | null;
}) {
  const label = formatCount(count);

  return (
    <Link
      href={category.href}
      className="group relative block overflow-hidden rounded-tile"
    >
      <div className="relative aspect-[3/4] w-full">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
            style={{
              backgroundImage: `linear-gradient(155deg, ${category.gradient[0]} 0%, ${category.gradient[1]} 100%)`,
            }}
          />
        )}

        {/* Scrim. Keeps the type legible whatever sits behind it. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
          <div className="min-w-0">
            <h3 className="font-serif text-[26px] leading-tight text-white">
              {category.title}
            </h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/75">
              {label ?? "Browse"}
            </p>
          </div>

          <span
            aria-hidden
            className="mb-1 shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1"
          >
            <ArrowRight size={22} />
          </span>
        </div>
      </div>
    </Link>
  );
}
