import { BookTextIcon, Github, GithubIcon } from 'lucide-react';

export default function Index() {
  return (
    <div>
      <div className="bg-[#111111] min-h-screen p-4">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-6 flex flex-row justify-start items-center w-full gap-1">
              <img
                src="https://tryintent.com/intent-logo-light.png"
                alt="Intent Logo"
                className="h-12"
                aria-label="Intent logo"
              />
              <h1 className="text-white text-2xl font-bold font-primary">
                Intent
              </h1>
            </div>
            <div className="text-center font-code flex flex-col items-start justify-start w-full text-white">
              <p>
                1. Get started by editing22{' '}
                <code className="bg-black/[.05] text-[#9AD422] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
                  views/pages/home.tsx
                </code>
              </p>
              <p>2. Save and see your changes instantly.</p>
            </div>
            <div className="flex flex-row items-start justify-start w-full gap-2 mt-8">
              <a
                href="#"
                className="border border-gray-700 text-white px-4 py-2 rounded-2xl font-code"
              >
                <span className="mr-2 flex flex-row items-center justify-center gap-2">
                  <BookTextIcon size={16} />
                  Read our docs
                </span>
              </a>
              <a
                href="https://github.com/intentjs/intent/issues"
                className="border border-gray-700 text-white px-4 py-2 rounded-2xl font-code"
              >
                <span className="mr-2 flex flex-row items-center justify-center gap-2">
                  <GithubIcon size={16} />
                  Raise Issue on GitHub
                </span>
              </a>
            </div>
          </div>

          {/* <div className="flex gap-8 mt-16 text-gray-400">
            <a href="#" className="flex items-center">
              <span className="mr-2">📚</span> Learn
            </a>
            <a href="#" className="flex items-center">
              <span className="mr-2">📝</span> Examples
            </a>
            <a href="https://nextjs.org" className="flex items-center">
              Go to nextjs.org <span className="ml-1">→</span>
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}
