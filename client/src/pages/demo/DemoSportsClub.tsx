import { sportsClubProfile } from "@shared/demo-profiles";
import { DemoSite } from "./DemoSite";
import heroImage from "@assets/stock_images/cycling_club_group_b_cc4a37a2.jpg";

export default function DemoSportsClub() {
  return (
    <DemoSite 
      profile={sportsClubProfile} 
      baseUrl="/demo/sports-club"
      heroImage={heroImage}
    />
  );
}
