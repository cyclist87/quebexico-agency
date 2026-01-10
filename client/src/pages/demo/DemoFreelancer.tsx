import { freelancerProfile } from "@shared/demo-profiles";
import { DemoSite } from "./DemoSite";
import heroImage from "@assets/stock_images/home_renovation_kitc_06481371.jpg";

export default function DemoFreelancer() {
  return (
    <DemoSite 
      profile={freelancerProfile} 
      baseUrl="/demo/freelancer"
      heroImage={heroImage}
    />
  );
}
