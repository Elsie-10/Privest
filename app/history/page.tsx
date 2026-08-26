import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/footer";
import HistoryView from "@/components/History/HistoryView";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <HistoryView />
      <Footer />
    </div>
  );
}
