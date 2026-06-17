import React from 'react';

const HomePageLoader = ({
  fullScreen = false,
  label = 'Loading…',
  sublabel = 'Please wait a moment.',
}) => {
  return (
    <div
      className={`flex w-full items-center justify-center px-4 py-12 ${
        fullScreen ? 'min-h-screen bg-[var(--background-subtle)]' : 'py-16'
      }`}
    >
      <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-sm shadow-purple-500/5 backdrop-blur-sm">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {sublabel && (
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{sublabel}</p>
        )}
      </div>
    </div>
  );
};

export default HomePageLoader;
