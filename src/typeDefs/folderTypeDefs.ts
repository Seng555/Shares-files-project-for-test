import { gql } from 'apollo-server';

export const folderTypeDefs = gql`
  type Folder {
    _id: Int!
    name: String!
    path: String
    parent_key: Int
    created_by: Int!
    sub: [Folder] 
  }

 

  input CreateFolderInput {
    name: String!
    path: String
    parent_key: Int
  }

  type oneFolder {
    _id: Int!
    name: String!
    path: String
    parent_key: Int
    created_by: Int!
    sub: [Folder] 
    files: [File]
  }

  type Query {
    folders: [Folder]
    folder(folderId: Int!): oneFolder
  }

  type Mutation {
    createFolder(input: CreateFolderInput!): CreateFolderResponse!
    deleteFolder(folderId: Int!): DeleteFolderResponse!
  }

  type CreateFolderResponse {
    success: Boolean!
    message: String!
    insertId: Int!
  }

  type DeleteFolderResponse {
    success: Boolean!
    message: String!
  }
`;
