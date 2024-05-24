import { AuthenticationError } from 'apollo-server';
import { createFileInDatabase, getFileFromDatabase } from '../controller/files';
import { middleware } from '../middleware/getToken';

export const fileResolvers = {
  Query: {
    file: async (parent: any, {fileId}: { fileId: number }, context: any) => {
      // Check authentication using middleware
      const user = middleware(context.req.rawHeaders, 'Authorization');
      if (!user) {
        throw new AuthenticationError('You must be logged in to view files.');
      }
      // Call getFileFromDatabase function to fetch a single file
      return getFileFromDatabase(fileId, user._id);
    }
  },
  Mutation: {
    createFile: async (parent: any, { input }: { input: CreateFileInput }, context: any) => {
      // Check authentication using middleware
      const user = middleware(context.req.rawHeaders, 'Authorization');
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a file.');
      }
      // Call createFileInDatabase function to create a new file
      return createFileInDatabase(input.folder_id, input.name, user._id);
    }
  }
};


