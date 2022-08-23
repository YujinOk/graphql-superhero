import { ApolloServer, gql } from "apollo-server";
import { getSuperHero, addOrEditHero } from "./dynamo.js";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Powerstats {
    combat: Int
    durability: Int
    intelligence: Int
    power: Int
    speed: Int
    strength: Int
  }
  input PowerstatsInput {
    combat: Int
    durability: Int
    intelligence: Int
    power: Int
    speed: Int
    strength: Int
  }
  type Superhero {
    id: String
    name: String
    img: String
    powerstats: Powerstats
  }
  input SuperheroInput {
    name: String
    img: String
    powerstats: PowerstatsInput
  }
  type Response {
    success: Boolean!
    message: String
  }

  type Mutation {
    # mutationname(arg: argType): returnType
    postHero(heroInfo: SuperheroInput): Response
  }

  type Query {
    superhero: [Superhero]
  }
`;



// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves superhero data from the getSuperHero function (fetching API)
const resolvers = {
  Query: {
    superhero: () => getSuperHero(),
  },
  Mutation: {
    postHero: async (_, { heroInfo }) => {
      try {
        const postResults = await addOrEditHero(heroInfo);
        return {
          success: !!postResults,
          message: `${heroInfo.name} has been stored successfully!`,
        };
      } catch (e) {
        return { success: false, message: e };
      }
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  /**
   * What's up with this embed: true option?
   * These are our recommended settings for using AS;
   * they aren't the defaults in AS3 for backwards-compatibility reasons but
   * will be the defaults in AS4. For production environments, use
   * ApolloServerPluginLandingPageProductionDefault instead.
   **/
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
