import ModelGallery from './components/ModelGallery'

export default function App() {
  return (
    <div className="min-h-screen">
      <a
        href="#gallery"
        className="focus:bg-gold-500 focus:text-ink-950 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:px-5 focus:py-2"
      >
        Skip to gallery
      </a>

      <header className="border-b hairline">
        <div className="mx-auto flex max-w-[110rem] items-center justify-between gap-6 px-4 py-5 sm:px-8">
          <a href="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-gold-400 text-2xl leading-none font-semibold tracking-[0.16em]">
              FSIA
            </span>
            <span className="text-bone-400 hidden text-[0.66rem] tracking-[0.24em] uppercase sm:block">
              Forever Star India Award
            </span>
          </a>
          <nav aria-label="Primary" className="text-bone-400 flex items-center gap-6 text-xs tracking-[0.16em] uppercase">
            <a href="#gallery" className="hover:text-gold-300 transition-colors">
              Gallery
            </a>
            <a
              href="https://www.fsia.in"
              className="border-gold-600/50 hover:border-gold-400 hover:text-gold-200 rounded-full border px-4 py-2 transition-colors"
            >
              Register
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[110rem] px-4 pt-12 pb-8 sm:px-8 sm:pt-16">
        <p className="text-eyebrow text-gold-500">Titleholders &amp; verified contestants</p>
        <h1 className="font-display text-bone-100 mt-3 max-w-4xl text-5xl leading-[1.02] font-light sm:text-7xl">
          Model <span className="text-gold-400 italic">Gallery</span>
        </h1>
        <p className="text-bone-300 mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
          Choose a profile to open that model&apos;s portfolio. Their details stay pinned while you browse —
          tap any frame for the full-resolution view.
        </p>
      </section>

      <div id="gallery" className="mx-auto max-w-[110rem] px-4 pb-24 sm:px-8">
        <ModelGallery />
      </div>

      <footer className="hairline border-t">
        <div className="text-bone-400 mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs sm:px-8">
          <p>Forever Star India Award — Model Gallery</p>
          <p className="tracking-[0.16em] uppercase">Portfolio imagery shown for demonstration</p>
        </div>
      </footer>
    </div>
  )
}
