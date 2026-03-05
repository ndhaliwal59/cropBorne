export function SidebarWordmark() {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: 'var(--text-primary)',
        }}
      >
        CROPBORNE
      </div>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: 2,
        }}
      >
        Sandoval Vineyard
      </div>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          marginTop: 2,
        }}
      >
        Fresno, CA · Block 7
      </div>
    </div>
  );
}
