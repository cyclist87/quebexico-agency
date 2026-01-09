import { freelancerProfile } from "@shared/demo-profiles";
import { DemoSite } from "./DemoSite";
import heroImage from "@assets/stock_images/professional_handyma_07e33c7f.jpg";

export default function DemoFreelancer() {
  return (
    <DemoSite 
      profile={freelancerProfile} 
      baseUrl="/demo/freelancer"
      heroImage={heroImage}
    />
  );
}
