export default function nullFilterHelper<T>(
  value: T | null | undefined
): value is T {
  return value !== null && value !== undefined;
}
