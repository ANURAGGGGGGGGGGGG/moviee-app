export default function Loading() {
  return (
    <div className="min-h-[100dvh]">
      <div className="sticky top-0 z-40 border-b border-line bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 sm:h-[72px] sm:px-6 lg:px-10">
          <div className="skeleton h-5 w-24" />
          <div className="ml-auto h-10 w-full max-w-[420px] rounded-full" />
        </div>
      </div>

      <div className="skeleton aspect-video w-full" />

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
        <div className="relative mt-8 grid gap-8 sm:mt-12 md:grid-cols-[220px_1fr] lg:grid-cols-[268px_1fr] lg:gap-12">
          <div className="skeleton aspect-[2/3] w-40 sm:w-52 md:w-full" />
          <div className="pt-2">
            <div className="skeleton h-3 w-48" />
            <div className="mt-7 h-1 w-12 bg-line-strong/50" />
            <div className="skeleton mt-5 h-12 w-3/4" />
            <div className="skeleton mt-5 h-3 w-1/3" />
            <div className="mt-8 flex items-center gap-4">
              <div className="skeleton h-10 w-36 rounded-full" />
              <div className="skeleton h-4 w-28" />
            </div>
            <div className="mt-14 h-px w-full bg-line" />
            <div className="mt-8 flex items-center gap-4">
              <div className="skeleton h-4 w-6" />
              <div className="skeleton h-5 w-28" />
              <div className="h-px flex-1 bg-line" />
            </div>
            <div className="skeleton mt-5 h-4 w-full max-w-[65ch]" />
            <div className="skeleton mt-3 h-4 w-5/6 max-w-[60ch]" />
            <div className="skeleton mt-3 h-4 w-2/3 max-w-[45ch]" />
          </div>
        </div>

        <div className="mt-16 h-px w-full bg-line" />
        <div className="mt-10 flex items-center gap-4">
          <div className="skeleton h-4 w-6" />
          <div className="skeleton h-5 w-32" />
          <div className="h-px flex-1 bg-line" />
        </div>
        <div className="skeleton mt-6 aspect-video w-full" />
      </div>
    </div>
  );
}
