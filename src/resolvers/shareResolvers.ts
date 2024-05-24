import { AuthenticationError } from 'apollo-server';
import { pool } from '../util/db';
import { middleware } from '../middleware/getToken';
import { createShareInDatabase, deleteShare, getAllSharesForMe, getAllSharesForUser } from '../controller/shares';

export const shareResolvers = {
  Query: {
    getAllSharesForUser: async (_: any, _arg: any, context: any) => {
      // Check authentication
      const user = middleware(context.req.rawHeaders, 'Authorization');
      if (!user) {
        throw new AuthenticationError('You must be logged in to Share a something.');
      }
      return await getAllSharesForUser(user._id);
    },
    getAllSharesForMe: async (_: any, _arg: any, context: any) => {
      // Check authentication
      const user = middleware(context.req.rawHeaders, 'Authorization');
      if (!user) {
        throw new AuthenticationError('You must be logged in to Share a something.');
      }
      return await getAllSharesForMe(user._id);
    },
  },
  Mutation: {
    createShare: async (_: any, { input }: { input: CreateShareInput }, context: any) => {
      // Check authentication
      const user = middleware(context.req.rawHeaders, 'Authorization');
      if (!user) {
        throw new AuthenticationError('You must be logged in to Share a something.');
      }
      return createShareInDatabase(input, user._id)
    },
     deleteShare: async (_: any, { shareId }: { shareId: number }, context: any) => {
       // Check authentication
       const user = middleware(context.req.rawHeaders, 'Authorization');
      if (!user) {
          throw new AuthenticationError('You must be logged in to Share a something.');
        }
      console.log(user);
      
       return deleteShare(shareId, user._id)
     },
  },
};
