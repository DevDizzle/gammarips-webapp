import { EmailCapture } from '@/components/email-capture';

export default function EmailCaptureSection() {
  return (
    <section className="relative border-t border-zinc-900 bg-zinc-950/40 py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <EmailCapture variant="default" />
      </div>
    </section>
  );
}
