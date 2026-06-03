import type { Metadata } from "next";
import { Footer } from "@/components/home/footer";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Why we built a wall of people who decided to exist out loud.",
};

export default function ManifestoPage() {
  return (
    <>
      <article className="container-reading max-w-[680px] pb-24 pt-[12rem]">
        <p className="eyebrow">The Manifesto</p>
        <h1 className="mt-6 font-display text-4xl font-light leading-[1.1] text-[var(--color-text-primary)] sm:text-[3.25rem]">
          A wall of people who decided to exist out loud
        </h1>

        <div className="mt-16 space-y-7 font-body text-[var(--color-text-secondary)] [&>p]:text-[1.1875rem] [&>p]:leading-[1.8]">
          <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:font-light first-letter:leading-[0.8] first-letter:text-[var(--color-text-primary)]">
            There is a strange asymmetry in the world. We document everything
            except the simplest fact — that a person was here, that they
            existed, that they chose to say so. Banks know your balance.
            Governments know your address. Algorithms know your hesitations. And
            yet nowhere is there a plain register where a person can stand and
            say: I exist, and I want that recorded, on my own terms, for no
            reason other than it is true.
          </p>

          <p>
            The Millionaire&apos;s Dollar is that register. It began as a
            provocation — would the wealthy, who can buy almost anything, pay a
            trivial sum for something that buys them nothing? Five euros. No
            product. No return. Only a tile on a wall and a point on a map. The
            absurdity is the instrument. A price too small to be a transaction
            and too deliberate to be an accident isolates the gesture from
            everything that usually contaminates it.
          </p>

          <blockquote className="border-l border-[var(--color-accent)] pl-6 font-display text-2xl font-light italic leading-snug text-[var(--color-text-primary)]">
            What remains when you remove the reward is the person.
          </blockquote>

          <p>
            We did not build a charity, and we did not build a marketplace. We
            built a record. Each tile carries only what its owner chooses:
            initials or a name, a country, a year, one line. The map shows where
            existence has been declared, never precisely — a city, an
            approximation, a deliberate blur. Privacy is not a feature we added.
            It is the grammar of the whole thing.
          </p>

          <p>
            People ask what it is <em>for</em>. The honest answer is that the
            wall is for itself. It is for the person who adds themselves and for
            everyone who reads the list afterwards and understands that all of
            these were real. There is a quiet dignity in a long list of people
            who wanted nothing except to be counted.
          </p>

          <p>
            We keep ourselves out of it, for now. Not from mystery for its own
            sake, but because a record should not be louder than the people on
            it. There will be more, later — a next phase we will not describe
            here, because describing it would change what the wall is while it
            is still being written. If you are the kind of person who joins a
            thing before it explains itself, you already understand.
          </p>

          <p>
            For now, read the wall as what it is: a register of people who, on
            an ordinary day, decided to exist out loud.
          </p>

          <p className="pt-8 font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
            — The Curators
          </p>
        </div>
      </article>
      <Footer />
    </>
  );
}
