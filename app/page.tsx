import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold mb-6">
          Front CSV Importer
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Aplicación con Clean Architecture + Next.js App Router
        </p>
        <Link
          href="/csvImport"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Ir a SVC Import
        </Link>
      </main>
    </div>
  );
}
