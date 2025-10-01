import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, actions }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-300 via-rose-200 to-pink-200 px-6 py-10 text-slate-900 shadow-2xl">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_60%)] opacity-50 mix-blend-soft-light"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
          {subtitle ? <p className="text-base text-slate-700 sm:text-lg">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">{actions}</div> : null}
      </div>
    </section>
  );
};

export default PageHero;
