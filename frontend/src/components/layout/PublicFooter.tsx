export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} My Blog. Built with Next.js & Express.</p>
      </div>
    </footer>
  );
}