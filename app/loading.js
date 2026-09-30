const SKELETON_COUNT = 10;

export default function Loading() {
  return (
    <div className="min-h-[100dvh]">
      <div className="sticky top-0 z-40 border-b border-line bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 sm:h-[72px] sm:px-6 lg:px-10">
          <div className="skeleton h-5 w-24" />
          <div className="ml-auto h-10 w-full max-w-[420px] rounded-full" />
          <div className="skeleton hidden h-10 w-28 rounded-full sm:block" />
        </div>
      </div>

      <div className="skeleton h-[64svh] max-h-[720px] min-h-[440px] w-full" />

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-10">
        <div className="skeleton h-10 w-56" />
        <div className="skeleton mt-4 h-4 w-40" />

        <ul className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <li key={i}>
              <div className="skeleton aspect-[2/3] w-full" />
              <div className="skeleton mt-3 h-4 w-3/4" />
              <div className="skeleton mt-2 h-3 w-1/3" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
