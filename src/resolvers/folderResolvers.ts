import { AuthenticationError } from "apollo-server";
import { GetFolder, GetFolders, createFolderInDatabase, deleteFolderFromDatabase } from "../controller/folder";
import { verifyToken } from "../util/jwt";
import { middleware } from "../middleware/getToken";
import { getFilesFromDatabase } from "../controller/files";

export const folderResolvers = {
    Query: {
      folders: async (parent: any, args: any, context: any) => {
       //console.log('dfffffffffffffffff');
       const user = middleware(context.req.rawHeaders, 'Authorization');
       if (!user) {
         throw new AuthenticationError('You must be logged in to create a folder.');
       }
       //console.log(user);
       return GetFolders(user._id)
      },
      folder: async (parent: any, { folderId }: { folderId: number }, context: any) => {
        // Check authentication using middleware
        const user = middleware(context.req.rawHeaders, 'Authorization');
        if (!user) {
          throw new AuthenticationError('You must be logged in to view folders.');
        }
        
        // Call GetFolder function to fetch the folder details
        const folder = await GetFolder(folderId, user._id);
  
        // Fetch files associated with the folder
        const files = await getFilesFromDatabase(folderId, user._id);
  
        // Add the files array to the folder object
        folder.files = files;
  
        return folder;
      }
    },
    Mutation: {
      createFolder: async (_: any, { input }: { input: { name: string, path: string, parent_key?: number } }, context: any) => {
       //console.log('dfffffffffffffffff');
        const user = middleware(context.req.rawHeaders, 'Authorization');
        if (!user) {
          throw new AuthenticationError('You must be logged in to create a folder.');
        }
        //console.log(user);
        return createFolderInDatabase(input.name, input.path, input.parent_key, user._id);
      },
      deleteFolder: async (_: any, { folderId }: { folderId: number }, context: any) => {
        //console.log('dfffffffffffffffff');
        const user = middleware(context.req.rawHeaders, 'Authorization');
        if (!user) {
          throw new AuthenticationError('You must be logged in to create a folder.');
        }
        //console.log(user);
        return await deleteFolderFromDatabase(folderId, user._id);
      },
    },
    
  };