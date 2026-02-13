import { getDailyReport } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const report = await getDailyReport(date);
  return {
    title: report?.title || `Report ${date} | GammaRips`,
    description: `Overnight Edge report for ${date}`,
  };
}

export default async function ReportPage({ params }: Props) {
  const { date } = await params;
  const report = await getDailyReport(date);
  if (!report) return notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
      <div className="flex gap-4 mb-8 text-sm text-muted-foreground">
        <span>{report.scan_date}</span>
        <span>{report.total_signals} signals</span>
        <span>📈 {report.bullish_count} bull</span>
        <span>📉 {report.bearish_count} bear</span>
      </div>
      <article className="prose prose-invert max-w-none">
        <ReactMarkdown>{report.content}</ReactMarkdown>
      </article>
    </div>
  );
}
