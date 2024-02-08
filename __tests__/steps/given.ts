import Chance from "chance";
const chance = new Chance();

export const a_random_user = () => {
  const firstName = chance.first({ nationality: "en" });
  const lastName = chance.first({ nationality: "en" });
  const name = `${firstName} ${lastName}`;
  const password = chance.string({ length: 10 });
  const email = `${firstName}-${lastName}@serverlesscreed.com`;
  return { name, password, email };
};
