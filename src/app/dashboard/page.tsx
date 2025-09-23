import Link from "next/link";
import TodaysWinners from "@/app/dashboard/todays-winners";
import OptionsCandidatesTable from "@/app/dashboard/options-candidates-table";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <TodaysWinners />
      <OptionsCandidatesTable />
    </div>
  );
}
