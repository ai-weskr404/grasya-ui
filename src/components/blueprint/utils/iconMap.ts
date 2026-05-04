// Canonical icon mapping for migrating other icon libraries to Blueprint icons.
// This file is intentionally conservative and is a living map — expand as we replace icons.
export const iconMap: Record<string, string> = {
  // Blueprint native usages (already in App.tsx)
  pulse: "pulse",
  "chevron-left": "chevron-left",
  "chevron-right": "chevron-right",
  cross: "cross",
  desktop: "desktop",
  code: "code",
  flash: "flash",
  "flow-branch": "flow-branch",
  server: "database",
  refresh: "refresh",
  document: "document",
  play: "play",
  pause: "pause",
  stop: "stop",
  shield: "shield",
  search: "search",
  eraser: "eraser",
  "warning-sign": "warning-sign",
  database: "database",
  th: "th",

  // Mappings for lucide/react icons (PascalCase names)
  Server: "database",
  Database: "database",
  Cloud: "cloud",
  Check: "tick",
  ChevronRight: "chevron-right",
  ChevronLeft: "chevron-left",
  X: "cross",
  Settings: "cog",
  Save: "floppy-disk",
  UploadCloud: "cloud-upload",
};

export default iconMap;
