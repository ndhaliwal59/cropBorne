interface SidebarFooterProps {
  isCached?: boolean;
  cachedTimestamp?: string;
}

export function SidebarFooter({ isCached = false, cachedTimestamp }: SidebarFooterProps) {
  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: isCached ? 'var(--amber)' : 'var(--text-tertiary)',
      }}
    >
      {isCached && cachedTimestamp
        ? `Cached data · ${cachedTimestamp}`
        : 'WindBorne Systems · 2026'}
    </div>
  );
}
