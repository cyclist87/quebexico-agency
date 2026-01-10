import { professionalProfile } from "@shared/demo-profiles";
import { DemoSite } from "./DemoSite";
import heroImage from "@assets/stock_images/professional_busines_13c2754b.jpg";

export default function DemoProfessional() {
  return (
    <DemoSite 
      profile={professionalProfile} 
      baseUrl="/demo/professional"
      heroImage={heroImage}
    />
  );
}
