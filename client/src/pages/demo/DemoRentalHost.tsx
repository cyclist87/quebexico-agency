import { rentalHostProfile } from "@shared/demo-profiles";
import { DemoSite } from "./DemoSite";
import heroImage from "@assets/stock_images/cozy_winter_cabin_ch_cd99d6d4.jpg";

export default function DemoRentalHost() {
  return (
    <DemoSite 
      profile={rentalHostProfile} 
      baseUrl="/demo/chalet"
      heroImage={heroImage}
    />
  );
}
