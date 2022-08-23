import AWS from "aws-sdk";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "superhero-api-new";

const getSuperHero = async () => {
  const params = {
    TableName: TABLE_NAME,
  };
  const heroes = await dynamoClient.scan(params).promise();
  console.log(heroes);
  return heroes.Items;
};

// 1. maps through the item
// 2. checking the name of curItem.name===heroInfo.name
// 3. if they are the same, then no new id needs to be created

const addOrEditHero = async (heroInfo) => {
  const superheroes = await getSuperHero();
  const foundExistingSuperHero = superheroes.find(({ name }) => {
    return name === heroInfo.name;
  });

  let params;
  if (!foundExistingSuperHero) {
    const heroInfoWId = { ...heroInfo };
    heroInfoWId.id = uuidv4();
    params = {
      TableName: TABLE_NAME,
      Item: heroInfoWId,
    };
  } else {
    const heroInfoWId = { ...heroInfo };
    heroInfoWId.id = foundExistingSuperHero.id;
    params = {
      TableName: TABLE_NAME,
      Item: heroInfoWId,
    };
  }

  return await dynamoClient.put(params).promise();
};
export { getSuperHero, addOrEditHero };
