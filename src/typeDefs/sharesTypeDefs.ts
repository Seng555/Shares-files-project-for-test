import { gql } from 'apollo-server';

export const shareTypeDefs = gql`
  type Share {
    _id: Int!
    data_id: Int!
    type: Int!  # 0 for folder, 1 for file
    created_by: Int!
    receive_id: Int!
    created_date: String!
    update_date: String!
    role: Int!  # 0 for full control, 1 for read-only,
    name: String!
  }

  input CreateShareInput {
    data_id: Int!
    type: Int!
    receive_id: Int!
    role: Int!
  }

  type Query {
    ## shares: [Share]
    getAllSharesForUser: [Share]!
    getAllSharesForMe: [Share]!
  }

  type Mutation {
    createShare(input: CreateShareInput!): CreateShareResponse!
    deleteShare(shareId: Int!): DeleteShareResponse
  }

  type CreateShareResponse {
    success: Boolean!
    message: String!
    insertId: Int!
  }

  type DeleteShareResponse {
    success: Boolean!
    message: String!
}
`;
