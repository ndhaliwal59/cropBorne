import './SidebarFooter.css';

interface SidebarFooterProps {
  isCached?: boolean;
  cachedTimestamp?: string;
}

export function SidebarFooter({ isCached = false, cachedTimestamp }: SidebarFooterProps) {
  return (
    <div
      className="sidebarFooter__root"
      data-cached={isCached}
    >
      {isCached && cachedTimestamp
        ? `Cached data · ${cachedTimestamp}`
        : 'WindBorne Systems · 2026'}
    </div>
  );
}
