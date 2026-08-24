import { Header } from '@/components/sections/Header';
import { Hero } from '@/components/sections/Hero';
import { StatsBar } from '@/components/sections/StatsBar';
import { Overview } from '@/components/sections/Overview';
import { WhyExhibit } from '@/components/sections/WhyExhibit';
import { WhoShouldExhibit } from '@/components/sections/WhoShouldExhibit';
import { Industries } from '@/components/sections/Industries';
import { FloorPlan } from '@/components/sections/FloorPlan';
import { StandPackages } from '@/components/sections/StandPackages';
import { BoothDesign } from '@/components/sections/BoothDesign';
import { BuyerProgramme } from '@/components/sections/BuyerProgramme';
import { ExhibitorBenefits } from '@/components/sections/ExhibitorBenefits';
import { Sponsorship } from '@/components/sections/Sponsorship';
import { CommercialCTA } from '@/components/sections/CommercialCTA';
import { BookingPreview } from '@/components/sections/BookingPreview';
import { PaymentInfo } from '@/components/sections/PaymentInfo';
import { ExhibitorManual } from '@/components/sections/ExhibitorManual';
import { VisitorRegistration } from '@/components/sections/VisitorRegistration';
import { FAQ } from '@/components/sections/FAQ';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/sections/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <Overview />
        <WhyExhibit />
        <WhoShouldExhibit />
        <Industries />
        <FloorPlan />
        <StandPackages />
        <BoothDesign />
        <BuyerProgramme />
        <ExhibitorBenefits />
        <Sponsorship />
        <CommercialCTA />
        <BookingPreview />
        <PaymentInfo />
        <ExhibitorManual />
        <VisitorRegistration />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
