/** Pass-through loader so marketplace listing images work without per-host remotePatterns. */
export default function timexImageLoader({
  src,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return src;
}
