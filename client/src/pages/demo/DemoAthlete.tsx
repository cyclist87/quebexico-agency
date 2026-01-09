import { athleteProfile } from "@shared/demo-profiles";
import { DemoSite } from "./DemoSite";
import heroImage from "@assets/stock_images/professional_road_cy_e42ef465.jpg";

export default function DemoAthlete() {
  return (
    <DemoSite 
      profile={athleteProfile} 
      baseUrl="/demo/athlete"
      heroImage={heroImage}
    />
  );
}
