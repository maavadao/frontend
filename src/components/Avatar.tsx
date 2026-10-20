import Image from "next/image";
import { avatarUrl } from "@/lib/developers";

/** A round GitHub avatar, or the person's initial when there's no GitHub account. */
export function Avatar({
  id,
  login,
  name,
  size,
  className = "",
}: {
  id?: number;
  login?: string | null;
  name: string;
  size: number;
  className?: string;
}) {
  const box = `shrink-0 rounded-full bg-bg-alt ${className}`;
  if (!id && !login) {
    return (
      <span
        aria-hidden="true"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        className={`${box} flex items-center justify-center font-semibold text-fg-2 uppercase`}
      >
        {name.slice(0, 1)}
      </span>
    );
  }
  return <Image src={avatarUrl({ id, login })} alt="" width={size} height={size} className={box} />;
}
