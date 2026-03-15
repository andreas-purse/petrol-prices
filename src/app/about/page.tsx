import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Our Data",
  description:
    "How Find My Fuel gets its data: official CMA-mandated retailer feeds covering 7,000+ UK fuel stations.",
};

const RETAILERS = [
  "Ascona Group",
  "Asda",
  "BP",
  "Esso Tesco Alliance",
  "JET",
  "Karan Retail",
  "Morrisons",
  "Moto",
  "Motor Fuel Group",
  "Rontec",
  "Sainsbury's",
  "SGN",
  "Shell",
  "Tesco",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-secondary hover:underline"
      >
        &larr; Back to map
      </Link>

      <h1 className="mb-6 font-heading text-3xl font-bold">About Our Data</h1>

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-xl font-semibold">Where does the data come from?</h2>
        <p className="mb-3 text-muted-foreground">
          Every price you see on Find My Fuel comes directly from{" "}
          <strong>official retailer feeds mandated by the UK government</strong>.
        </p>
        <p className="text-muted-foreground">
          In 2023, the Competition and Markets Authority (CMA) completed a{" "}
          <a
            href="https://www.gov.uk/government/publications/road-fuel-market-study"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline"
          >
            road fuel market study
          </a>{" "}
          and recommended that the largest fuel retailers publish their pump prices in a
          standardised, open format. This means retailers are{" "}
          <strong>legally required</strong> to publish accurate, up-to-date prices.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-xl font-semibold">Why you can trust it</h2>
        <div className="space-y-3">
          <div className="flex gap-3 rounded-lg bg-muted/50 p-4">
            <span className="mt-0.5 text-lg text-cheap">&#10003;</span>
            <div>
              <p className="font-medium">Government-mandated</p>
              <p className="text-sm text-muted-foreground">
                Retailers are legally required to publish prices. This isn&apos;t crowdsourced
                or estimated — it&apos;s official data.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-muted/50 p-4">
            <span className="mt-0.5 text-lg text-cheap">&#10003;</span>
            <div>
              <p className="font-medium">Updated daily</p>
              <p className="text-sm text-muted-foreground">
                We fetch fresh data from all 14 retailer feeds every day to keep prices
                current.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-muted/50 p-4">
            <span className="mt-0.5 text-lg text-cheap">&#10003;</span>
            <div>
              <p className="font-medium">Freshness indicators</p>
              <p className="text-sm text-muted-foreground">
                Every station shows when its prices were last verified. Green means fresh,
                amber means aging, red means stale.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-muted/50 p-4">
            <span className="mt-0.5 text-lg text-cheap">&#10003;</span>
            <div>
              <p className="font-medium">7,000+ stations</p>
              <p className="text-sm text-muted-foreground">
                Covering the vast majority of UK fuel stations from 14 major retailers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-xl font-semibold">Retailers we cover</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {RETAILERS.map((name) => (
            <div
              key={name}
              className="rounded-md bg-muted/50 px-3 py-2 text-sm font-medium"
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-heading text-xl font-semibold">Freshness indicators</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-cheap" />
            <span className="text-sm">
              <strong>Green</strong> — Updated within the last 12 hours
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-mid" />
            <span className="text-sm">
              <strong>Amber</strong> — Updated 12–48 hours ago
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-expensive" />
            <span className="text-sm">
              <strong>Red</strong> — Updated more than 48 hours ago (may be outdated)
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-semibold">Questions?</h2>
        <p className="text-muted-foreground">
          Find My Fuel is built to help UK drivers save money on fuel. If you spot
          incorrect data, it&apos;s likely because the retailer hasn&apos;t updated their
          CMA feed recently — check the freshness indicator to see when prices were last
          verified.
        </p>
      </section>
    </div>
  );
}
