import { gql } from 'apollo-server';

export const userTypeDefs = gql`
  type User {
    _id: Int!
    name: String!
    email: String!
  }

  type UserLogin {
    success: Boolean!
    token: String!
  }

  type CreateUserResponse {
    success: Boolean!
    message: String!
  }

  type Query {
    login(email: String!): UserLogin!
  }

  type Mutation {
    register(name: String!, email: String!): CreateUserResponse!
  }
`;
