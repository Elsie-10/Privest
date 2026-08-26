import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Landing/Hero";
import Footer from "@/components/Footer/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}
