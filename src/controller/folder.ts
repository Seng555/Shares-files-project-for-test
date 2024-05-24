import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../util/db";

export const createFolderInDatabase = async (
  name: string,
  path: string,
  parent_key: number | null = null,
  userId: number
) => {
  try {
    // Check if the name already exists in the database for the specific parent_key
    let query = 'SELECT _id FROM Folders WHERE name = ? AND created_by = ?';
    const queryParams = [name, userId];

    // Include the condition for parent_key if it's provided
    if (parent_key !== null) {
      query += ' AND parent_key = ?';
      queryParams.push(parent_key);
    }

    const [existingFolders] = await pool.query(query, queryParams);

    if (!Array.isArray(existingFolders) || existingFolders.length > 0) {
      throw new Error(`A folder with the ${name} already exists`);
    }

    let parentPath = '';
    if (parent_key) {
      // Fetch the path of the parent folder
      const [parentFolder] = await pool.query<any>(
        'SELECT * FROM `Folders` WHERE _id = ? AND created_by = ?',
        [parent_key, userId]
      );
      if (parentFolder.length === 0) {
        throw new Error(`Parent folder with id '${parent_key}' not found`);
      }
      parentPath = parentFolder[0].path ?? parentFolder[0].name;
    }

    // Construct the full path of the new folder
    const fullFolderPath = parentPath ? `${parentPath}/${name}` : name;

    // Insert the new folder
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Folders (name, path, parent_key, created_by) VALUES (?, ?, ?, ?)',
      [name, fullFolderPath, parent_key, userId]
    );
    // console.log(result);

    // Retrieve the ID of the newly created folder
    //const newFolderId = result;

    // Fetch the details of the newly created folder
    /* const [newFolderRows] = await pool.query('SELECT * FROM Folders WHERE _id = ?', [newFolderId]);
     const newFolder = newFolderRows[0];*/

    return {
      success: true,
      message: 'Folder created successfully',
      insertId: result.insertId,
    };
  } catch (error) {
    console.error('Error creating folder in database:', error);
    throw error;
  }
};
export const GetFolders = async (userId: number): Promise<Folder[]> => {
  try {
    // Fetch the top-level folders created by the user
    const [folders] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Folders WHERE created_by = ? AND parent_key IS NULL',
      [userId]
    );

    const foldersWithSub: Folder[] = await Promise.all(
      (folders as Folder[]).map(async (folder) => {
        const [subfolders] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM Folders WHERE parent_key = ?',
          [folder._id]
        );
        folder.sub = subfolders as Folder[];
        return folder;
      })
    );

    return foldersWithSub;
  } catch (error) {
    console.error('Error fetching folders from database:', error);
    throw error;
  }
};

export const GetFolder = async (folderId: number, userId: number): Promise<FolderOne> => {
  try {
    // Fetch the main folder
    const [mainFolder] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Folders WHERE _id = ?',
      [folderId, userId]
    );  // AND created_by = ?'
    //console.log(userId, mainFolder);

    if (!mainFolder || mainFolder.length === 0) {
      throw new Error(`Folder with ID '${folderId}' not found for the user`);
    }
    let owner_id;
    if (mainFolder[0].created_by !== userId) {
      // Check access from Shares
      const hasAccess = await checkAccessThroughShares(folderId, userId);
      //console.log(hasAccess);
      owner_id = hasAccess.created_by;
      if (!hasAccess.status) {
        throw new Error('Access denied');
      }
    }

    // Fetch subfolders of the main folder based on ownership
    let subFolderQuery = 'SELECT * FROM Folders WHERE parent_key = ?';
    let subFolderParams = [folderId];

    if (owner_id && owner_id !== mainFolder[0].created_by) {
      // If the current user is not the owner, add a condition to select subfolders based on the owner ID
      subFolderQuery += ' AND created_by = ?';
      subFolderParams.push(owner_id);
    }

    const [subFolders] = await pool.query<RowDataPacket[]>(subFolderQuery, subFolderParams);


    // Attach subfolders to the main folder
    mainFolder[0].sub = subFolders;
    return mainFolder[0] as FolderOne;
  } catch (error) {
    console.error('Error fetching folder from database:', error);
    throw error;
  }
};

export const deleteFolderFromDatabase = async (folderId: number, userId: number) => {
  try {

    // Check if the folder exists and belongs to the user
    const [folder] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Folders WHERE _id = ? AND created_by = ?',
      [folderId, userId]
    );

    if (!folder || folder.length === 0) {
      throw new Error(`Folder with ID '${folderId}' not found for the user`);
    }

    // Recursively delete subfolders
    await deleteSubfolders(folderId, userId);

    // Delete the folder and its associated files from the database
    await pool.query('DELETE FROM Files WHERE folder_id = ?', [folderId]);
    await pool.query('DELETE FROM Folders WHERE _id = ?', [folderId]);

    // Commit the transaction
    await pool.query('COMMIT');

    return { success: true, message: `Folder with ID '${folderId}' deleted successfully` };
  } catch (error) {
    // Rollback the transaction if an error occurs
    await pool.query('ROLLBACK');
    console.error('Error deleting folder from database:', error);
    throw error;
  }
};

const deleteSubfolders = async (parentFolderId: number, userId: number) => {
  const [subfolders] = await pool.query<any[]>(
    'SELECT _id FROM Folders WHERE parent_key = ?',
    [parentFolderId]
  );



  if (subfolders.length > 0) {
    // Recursively delete subfolders
    for (const subfolderId of subfolders) {
      await deleteFolderFromDatabase(subfolderId._id, userId);
    }
  }
};

const checkAccessThroughShares = async (folderId: number, userId: number): Promise<{ status: boolean, created_by: number | null }> => {
  try {
    const [shareRecords] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Shares WHERE data_id = ? AND type = 0 AND receive_id = ?',
      [folderId, userId]
    );

    if (shareRecords.length > 0) {
      return { status: true, created_by: shareRecords[0].created_by }; // Assuming created_by is not relevant if shared
    }

    // Fetch the parent_key and created_by of the current folder
    const [parentFolder] = await pool.query<RowDataPacket[]>(
      'SELECT parent_key, created_by FROM Folders WHERE _id = ?',
      [folderId]
    );
    if (!parentFolder || parentFolder.length === 0 || parentFolder[0].parent_key === null) {
      return { status: false, created_by: parentFolder.length > 0 ? parentFolder[0].created_by : null };
    }

    // Recursively check the parent folder
    return await checkAccessThroughShares(parentFolder[0].parent_key, userId);
  } catch (error) {
    console.error('Error checking access through shares:', error);
    throw error;
  }
};
