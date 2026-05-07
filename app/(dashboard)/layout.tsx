export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-6">
        <h2 className="mb-6 text-lg font-semibold">Autodrop</h2>
        <nav className="flex flex-col gap-2 text-sm">
          <a href="/" className="rounded-md px-3 py-2 hover:bg-muted">
            Dashboard
          </a>
          <a
            href="/automations"
            className="rounded-md px-3 py-2 hover:bg-muted"
          >
            Automations
          </a>
          <a
            href="/analytics"
            className="rounded-md px-3 py-2 hover:bg-muted"
          >
            Analytics
          </a>
          <a href="/leads" className="rounded-md px-3 py-2 hover:bg-muted">
            Leads
          </a>
          <a
            href="/referrals"
            className="rounded-md px-3 py-2 hover:bg-muted"
          >
            Referrals
          </a>
          <a href="/settings" className="rounded-md px-3 py-2 hover:bg-muted">
            Settings
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
