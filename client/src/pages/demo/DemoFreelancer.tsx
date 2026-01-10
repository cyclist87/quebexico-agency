import { freelancerProfile } from "@shared/demo-profiles";
import { DemoSite } from "./DemoSite";
import heroImage from "@assets/stock_images/professional_handyma_019040ee.jpg";

export default function DemoFreelancer() {
  return (
    <DemoSite 
      profile={freelancerProfile} 
      baseUrl="/demo/freelancer"
      heroImage={heroImage}
    />
  );
}
