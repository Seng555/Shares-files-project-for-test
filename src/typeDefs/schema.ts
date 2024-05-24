import { mergeTypeDefs } from '@graphql-tools/merge';
import { userTypeDefs } from './userTypeDefs';
import { folderTypeDefs } from './folderTypeDefs';
import { fileTypeDefs } from './fileTypeDefs';
import { shareTypeDefs } from './sharesTypeDefs';

export const typeDefs = mergeTypeDefs([
  userTypeDefs,
  folderTypeDefs,
  fileTypeDefs,
  shareTypeDefs
]);
