import { ImageEditor } from "@/components/image-editor";

export default function Home() {
  return (
    <main className="min-h-screen min-w-full">
      <section className="py-12 md:py-16 lg:py-24 mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold gap-3">
            Create
            <span className="relative inline-block py-1 px-4 mx-2 rounded-lg bg-black text-white">
              monotone-background
            </span>
            designs with just a few clicks.
          </h1>
        </div>

        <div className="mt-10">
          <ImageEditor />
        </div>
      </section>
    </main>
  );
}