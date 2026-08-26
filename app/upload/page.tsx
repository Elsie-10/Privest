import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/footer";
import UploadView from "@/components/Upload/UploadView";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <UploadView />
      <Footer />
    </div>
  );
}
