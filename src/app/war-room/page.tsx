import { Metadata } from 'next';
import WarRoomClient from './war-room-client';

export const metadata: Metadata = {
  title: "The War Room — Live Institutional Flow Alerts via WhatsApp",
  description: "Real-time institutional flow alerts delivered straight to your WhatsApp. Join The War Room for intraday signals and direct analyst access.",
  alternates: { canonical: 'https://gammarips.com/war-room' },
  openGraph: {
    title: "The War Room — Live Institutional Flow Alerts",
    description: "Real-time institutional flow alerts delivered straight to your WhatsApp.",
    url: "https://gammarips.com/war-room",
  }
};

export default function WarRoomPage() {
  return <WarRoomClient />;
}
