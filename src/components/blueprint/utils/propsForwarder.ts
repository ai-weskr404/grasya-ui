// Small utility to extract native props (data-*, aria-*, id, name, title)
export const extractNativeProps = (props: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const key of Object.keys(props)) {
    if (key.startsWith("data-") || key.startsWith("aria-") || key === "id" || key === "name" || key === "title") {
      out[key] = props[key];
    }
  }
  return out;
};

export default extractNativeProps;
