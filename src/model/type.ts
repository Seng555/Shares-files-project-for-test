type ResolverArgs = {
    email: string;
  };

  type CreateUserArgs = {
    name: string;
    email: string;
  };
  
  type ResolverResult = {
    success: boolean;
    message: string;
    // Add more fields if needed
  };
  type DefaultResponse = {
    success: boolean;
    message: string;
    data?: any; // Include a data field which can hold any type of data
  };

  type User = {
    _id: number
    name: String
    email: String
  }

  type CreateFolderInput = {
    name: string
    path?: string
    parent_key?: number
  }

  interface Folder {
    _id: number;
    name: string;
    path: string;
    parent_key: number | null;
    created_by: number;
    sub: Folder[]; // Add this property to include subfolders
  }

  interface CreateFileInput {
    folder_id: number
    name: string
  }

  interface FolderOne {
    _id: number;
    name: string;
    path: string;
    parent_key: number | null;
    created_by: number;
    Folder: Folder[];
    files: File[];
  }

  interface CreateShareInput {
    data_id: number
    type: number
    receive_id: number
    role: number
  }

  interface AccessStatus {
    status: boolean;
    role?: number; // Role of the user if they have access
}