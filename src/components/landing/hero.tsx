export function Hero({ headline, narrative }: { headline?: string; narrative?: string }) {
  return (
    <section className="py-8 md:py-12 text-center container px-4">
      <h1 className="text-4xl md:text-6xl font-bold font-headline mb-2 tracking-tight">
        The Overnight Edge
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
        See what institutions did last night.
      </p>
      {headline && (
        <div className="mt-4 p-4 bg-primary/10 rounded-lg max-w-xl mx-auto">
          <p className="text-xl font-semibold">{headline}</p>
          {narrative && <p className="text-sm text-muted-foreground mt-2">{narrative}</p>}
        </div>
      )}
    </section>
  );
}
