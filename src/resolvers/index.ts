import { merge } from 'lodash';
import { userResolvers } from './userResolvers';
import { folderResolvers } from './folderResolvers';
import { fileResolvers } from './filesResolvers';
import { shareResolvers } from './shareResolvers';

// Merge all resolvers
export const resolvers = merge(userResolvers, folderResolvers, fileResolvers, shareResolvers);