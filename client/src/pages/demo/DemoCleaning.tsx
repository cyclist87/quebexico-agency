import { cleaningProfile } from "@shared/demo-profiles";
import { DemoSite } from "./DemoSite";
import heroImage from "@assets/stock_images/professional_cleanin_f9a00c6b.jpg";

export default function DemoCleaning() {
  return (
    <DemoSite 
      profile={cleaningProfile} 
      baseUrl="/demo/cleaning"
      heroImage={heroImage}
    />
  );
}
