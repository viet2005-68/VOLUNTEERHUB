import React from "react";
import {
  TechBadge,
  EducationBadge,
  LeadBadge,
  EnvironmentBadge,
  GoldMedal,
  PeopleWithCommunityBadge,
  PlantBadge,
  BasicBadge,
  HandEarthBadge,
  SaveWaterBadge,
  AnimalBadge,
  SocietyBadge,
  BloodBadge,
} from "../../assets/Badge/index";
import Badge from "../../components/Badge/Badge";

const dumpdata = [
  { id: 1, title: "Tech Badge", description: "Tech Badge", icon: TechBadge },
  {
    id: 2,
    title: "Education Badge",
    description: "Education Badge",
    icon: EducationBadge,
  },
  { id: 3, title: "Lead Badge", description: "Lead Badge", icon: LeadBadge },
  {
    id: 4,
    title: "Environment Badge",
    description: "Environment Badge",
    icon: EnvironmentBadge,
  },
  { id: 5, title: "Gold Medal", description: "Gold Medal", icon: GoldMedal },
  {
    id: 6,
    title: "People With Community Badge",
    description: "People With Community Badge",
    icon: PeopleWithCommunityBadge,
  },
  { id: 7, title: "Plant Badge", description: "Plant Badge", icon: PlantBadge },
  { id: 8, title: "Basic Badge", description: "Basic Badge", icon: BasicBadge },
  {
    id: 9,
    title: "Hand Earth Badge",
    description: "Hand Earth Badge",
    icon: HandEarthBadge,
  },
  {
    id: 10,
    title: "Save Water Badge",
    description: "Save Water Badge",
    icon: SaveWaterBadge,
  },
  {
    id: 11,
    title: "Animal Badge",
    description: "Animal Badge",
    icon: AnimalBadge,
  },
  {
    id: 12,
    title: "Society Badge",
    description: "Society Badge",
    icon: SocietyBadge,
  },
  {
    id: 13,
    title: "Blood Badge",
    description: "Blood Badge",
    icon: BloodBadge,
  },
];
export default function Badges() {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col gap-10">
      <div>
        <p className="text-2xl font-semibold max-sm:text-md">
          Achievement Badges
        </p>
        <p className="text-gray-500">
          Your volunteer milestones and recognition
        </p>
      </div>
      <div className="grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1 max-sm:gap-8 lg:gap-10 px-10 gap-5 max-sm:px-20">
        {dumpdata.map((item) => (
          <Badge key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
