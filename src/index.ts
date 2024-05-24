import { ApolloServer, AuthenticationError } from 'apollo-server';
import { typeDefs } from './typeDefs/schema';
import { resolvers } from './resolvers';

// Create an instance of ApolloServer with middleware
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable introspection
  context: ({ req, res }) => {
    return {req, res};
  }
});

// Start the server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
