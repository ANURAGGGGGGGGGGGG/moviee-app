export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-10">
        <div>
          <p className="display text-lg">Screenly</p>
          <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-ink-dim">
            This Movie App uses the TMDb API but is not endorsed or certified by TMDb. Thanks to
            TMDb for their open API.
          </p>
        </div>
        <div className="slate flex flex-wrap items-center gap-x-6 gap-y-3 text-ink-dim">
          <a
            href="https://developer.themoviedb.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-ink"
          >
            API docs
          </a>
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-ink"
          >
            TMDb site
          </a>
        </div>
      </div>
    </footer>
  );
}
