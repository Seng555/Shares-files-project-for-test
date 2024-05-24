import { gql } from 'apollo-server';

export const fileTypeDefs = gql`
  type File {
    _id: Int!
    folder_id: Int!
    name: String!
    path: String!
    created_by: Int!
    created_date: String!
  }

  input CreateFileInput {
    folder_id: Int!
    name: String!
  }

  type Query {
    file(fileId: Int!): File!
  }

  type Mutation {
    createFile(input: CreateFileInput!): CreateFileResponse!
  }

  type CreateFileResponse {
    success: Boolean!
    message: String!
    insertId: Int!
  }
`;