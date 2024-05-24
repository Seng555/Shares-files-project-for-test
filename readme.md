# User Management API Documentation

# My Project

Welcome to my project! This README.md file provides an overview of the project's scripts and how to use them.

## Scripts

### 

This script starts your application in production mode. It executes the compiled `index.js` file located in the `dist` directory using Node.js.

```bash
- npm i  

- npm run dev

- npm run build 

```


## Register Mutation

Register a new user with the provided name and email.

### Input

- `name` (String!): The name of the user.
- `email` (String!): The email address of the user.

### Output

- `success` (Boolean!): Indicates whether the user registration was successful.
- `message` (String!): A message indicating the outcome of the registration process.

### Example

```
mutation {
  register(name: "John Doe", email: "john@example.com") {
    success
    message
  }
}
```

---
## Login Query

Authenticate the user using their email address.

### Input

- `email` (String!): The email address of the user.

### Output

- `success` (Boolean!): Indicates whether the login was successful.
- `token` (String!): An authentication token for the logged-in user.

### Example

```

query {
  login(email: "john@example.com") {
    success
    token
  }
}
```

---
### Authorization Required: Getting Token from Login

To access the endpoints, you need to include an authorization token in the headers. You can obtain this token by following these steps:

1. **Login**: Login Query Send By `Email`.
---
---
## Folder Type

Represents a folder in the file system.

- `_id` (Int!): The unique identifier of the folder.
- `name` (String!): The name of the folder.
- `path` (String): The path of the folder.
- `parent_key` (Int): The identifier of the parent folder.
- `created_by` (Int!): The user ID of the creator of the folder.
- `sub` ([Folder]): An array of subfolders contained within this folder.
---
### CreateFolderInput

This input type is used to specify the parameters for creating a new folder.

#### Fields

- `name` (String!): The name of the new folder. Required.
- `path` (String): The path of the new folder. Optional.
- `parent_key` (Int): The identifier of the parent folder. Optional.

#### Example

```
input CreateFolderInput {
  name: String!
  path: String
  parent_key: Int
}
```

### CreateFolderResponse

This type represents the response returned when a folder is created.

### Fields
- `success` (Boolean!): Indicates whether the folder creation was successful.
- `message` (String!): A message describing the result of the folder creation operation.
- `insertId` (Int!): The ID of the newly created folder.

---

### DeleteFolderInput

- This input type is used to specify the parameters for deleting a folder.
- Can Delete only owner folder 
- when delete process include All sub folder and All files in folder

#### Fields

- `folderId` (Int!): The ID of the folder to be deleted. Required.

#### Example

```
input DeleteFolderInput {
  folderId: Int!
}
```
#### DeleteFolderResponse

This type represents the response returned when a folder is deleted.

Fields
- `success` (Boolean!): Indicates whether the folder deletion was successful.
- `message` (String!): A message describing the result of the folder deletion operation.

---
### Query: folders

#### Input:

None

#### Output:

- `folders`: An array of `Folder` objects.

#### Folder Object:

- `_id`: Int (ID of the folder)
- `name`: String (Name of the folder)
- `path`: String (Path of the folder)
- `parent_key`: Int (ID of the parent folder, if any)
- `created_by`: Int (ID of the user who created the folder)
- `sub`: [Folder] (Array of subfolders within the folder)
---

### Query: folder

Get All subfolder on specific folder `only owner file and folder and only folder owner file and file and folder share with me`  

#### Input:

- `folderId`: Int (ID of the folder to retrieve)

#### Output:

- `folder`: A single `oneFolder` object representing the requested folder.

#### oneFolder Object:

- `_id`: Int (ID of the folder)
- `name`: String (Name of the folder)
- `path`: String (Path of the folder)
- `parent_key`: Int (ID of the parent folder, if any)
- `created_by`: Int (ID of the user who created the folder)
- `sub`: [Folder] (Array of subfolders within the folder)
- `files`: [File] (Array of files within the folder)

---
#### File Object:

- `_id`: Int (ID of the file)
- `folder_id`: Int (ID of the folder containing the file)
- `name`: String (Name of the file)
- `path`: String (Path of the file)
- `created_by`: Int (ID of the user who created the file)
- `created_date`: String (Date when the file was created)

--- 
### Query: file

#### Input:

- `fileId`: Int (ID of the file to retrieve)

#### Output:

- `file`: A single `File` object representing the requested file.

---
### Mutation: createFile

- Create file to Owner folder
- Create file to folder share from other, if full Access control

#### Input:

- `input`: CreateFileInput

#### CreateFileInput Object:

- `folder_id`: Int (ID of the folder where the file will be created)
- `name`: String (Name of the file)

#### Output:

- `createFile`: A `CreateFileResponse` object indicating the success or failure of the operation.

#### CreateFileResponse Object:

- `success`: Boolean (Indicates whether the file creation was successful)
- `message`: String (Descriptive message indicating the result of the operation)
- `insertId`: Int (ID of the newly created file, if successful)

---
### Query: file

#### Input:

- `fileId`: Int (ID of the file to retrieve)

#### Output:

- `file`: A single `File` object representing the requested file.

#### File Object:

- `_id`: Int (ID of the file)
- `folder_id`: Int (ID of the folder containing the file)
- `name`: String (Name of the file)
- `path`: String (Path of the file)
- `created_by`: Int (ID of the user who created the file)
- `created_date`: String (Date when the file was created)

--- 

#### Share Object:

- `_id`: Int (ID of the share)
- `data_id`: Int (ID of the shared data, either folder or file)
- `type`: Int (Type of the shared data, 0 for folder, 1 for file)
- `created_by`: Int (ID of the user who created the share)
- `receive_id`: Int (ID of the user who received the share)
- `created_date`: String (Date when the share was created)
- `update_date`: String (Date when the share was last updated)
- `role`: Int (Role of the user with the share, 0 for full control, 1 for read-only)
- `name`: String (Name of the shared data)

---

### Mutation: createShare
- Can Share owner folder or file to everyone
- Can Share folder share from other one to every one if full Access

#### Input:

  - `input`: CreateShareInput (Input data for creating a new share)
  - `data_id`: Int (ID of the data to be shared on Folder _id or Files _id)
  - `type`: Int (Type of the data to be shared, 0 for folder, 1 for file)
  - `receive_id`: Int (ID of the user who will receive the share)
  - `role`: Int (Role of the user with the share, 0 for full control, 1 for read-only)

#### Output:

- `createShare`: CreateShareResponse (Response indicating the success or failure of the operation)

#### CreateShareInput Object:

- `data_id`: Int (ID of the data to be shared)
- `type`: Int (Type of the data to be shared, 0 for folder, 1 for file)
- `receive_id`: Int (ID of the user who will receive the share)
- `role`: Int (Role of the user with the share, 0 for full control, 1 for read-only)

#### CreateShareResponse Object:

- `success`: Boolean (Indicates whether the operation was successful)
- `message`: String (Additional information/message about the operation)
- `insertId`: Int (ID of the newly created share, if applicable)

---
### Mutation: deleteShare
- Can delete share owner 
- can delete any share from other if full Access
#### Input:

- `shareId`: Int (ID of the share to be deleted)

#### Output:

- `deleteShare`: DeleteShareResponse (Response indicating the success or failure of the operation)

#### DeleteShareResponse Object:

- `success`: Boolean (Indicates whether the operation was successful)
- `message`: String (Additional information/message about the operation)

---
### Query: getAllSharesForUser

#### Output:

- `getAllSharesForUser`: [Share]! (List of shares belonging to the user)

#### Share Object:

- `_id`: Int! (Unique identifier for the share)
- `data_id`: Int! (ID of the shared data, either a file or a folder)
- `type`: Int! (Type of the shared data: 0 for folder, 1 for file)
- `created_by`: Int! (ID of the user who created the share)
- `receive_id`: Int! (ID of the user who received the share)
- `created_date`: String! (Date when the share was created)
- `update_date`: String! (Date when the share was last updated)
- `role`: Int! (Role assigned to the receiver: 0 for full control, 1 for read-only)
- `name`: String! (Name of the shared data)

---
### Query: getAllSharesForMe

#### Output:

- `getAllSharesForMe`: [Share]! (List of shares received by the user)

#### Share Object:

- `_id`: Int! (Unique identifier for the share)
- `data_id`: Int! (ID of the shared data, either a file or a folder)
- `type`: Int! (Type of the shared data: 0 for folder, 1 for file)
- `created_by`: Int! (ID of the user who created the share)
- `receive_id`: Int! (ID of the user who received the share)
- `created_date`: String! (Date when the share was created)
- `update_date`: String! (Date when the share was last updated)
- `role`: Int! (Role assigned to the receiver: 0 for full control, 1 for read-only)
- `name`: String! (Name of the shared data)