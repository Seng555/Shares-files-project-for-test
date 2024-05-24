import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../util/db";


export const getFileFromDatabase = async (fileId: number, userId: number) => {
    try {
        // Fetch the file from the database based on fileId and userId
        // AND created_by = ?
        const [file] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM Files WHERE _id = ?',
            [fileId, userId]
        );

        // If the user is not the owner of the file, check access through shares
        if (file[0].created_by !== userId) {
            const hasAccess = await checkAccessThroughShares(file[0].folder_id, userId);
            if (!hasAccess) {
                throw new Error('Access denied');
            }
        }
        // If file does not exist or is empty, throw an error
        if (!file || file.length === 0) {
            throw new Error(`File with ID '${fileId}' not found for the user`);
        }
        // Return the fetched file
        return file[0];
    } catch (error) {
        console.error('Error fetching file from database:', error);
        throw error;
    }
};

export const createFileInDatabase = async (folderId: number, name: string, userId: number) => {
    try {
        if (!folderId) {
            throw new Error(`folderId is required`);
        }
        // Fetch the folder from the database based on folderId
        const [folder] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM Folders WHERE _id = ?',
            [folderId]
        );
        // console.log(folder);
        
        // Check if the folder exists
        if (!folder || folder.length === 0) {
            throw new Error(`Folder with ID '${folderId}' not found`);
        }
       // console.log(folder);
        
        // Check if the user is the owner of the folder
        if (folder[0].created_by !== userId) {
            // Check access rights through shares 
            const hasAccess = await checkAccessThroughShares(folderId, userId);
            if (!hasAccess.status) {
                throw new Error(`User does not have permission to create a file in this folder`);
            }
        }

        //throw new Error(`User does not have permission to create a file in this folder`);
        // Fetch the file from the database based on fileId and userId
        const [file] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM Files WHERE name = ? AND created_by = ?',
            [name, userId]
        );
        // If file does not exist or is empty, throw an error
        if (!file || file.length > 0) {
            throw new Error(`Ready for '${name}'`);
        }
        // Get the folder path if available
        let folderPath = await getFolderPath(folderId);

        // Insert the new file into the database
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Files (folder_id, name, path, created_by) VALUES (?, ?, ?, ?)',
            [folderId, name, folderPath, userId]
        );

        // Retrieve the ID of the newly created file
        const fileId = result.insertId;

        // Return the details of the newly created file
        return {
            success: true,
            message: 'File created successfully',
            insertId: fileId
        };
    } catch (error) {
        console.error('Error creating file in database:', error);
        throw error;
    }
};

const getFolderPath = async (folderId: number): Promise<string> => {
    try {
        const [folderRows] = await pool.query<RowDataPacket[]>(
            'SELECT name, path, parent_key FROM Folders WHERE _id = ?',
            [folderId]
        );

        if (!folderRows || folderRows.length === 0) {
            throw new Error(`Folder with ID '${folderId}' not found`);
        }

        const folder = folderRows[0];
        let folderPath = folder.path || '';

        // If folder path is already provided, return it
        if (folderPath) {
            return folderPath;
        }

        // If parent_key is not null, recursively fetch parent folder path
        if (folder.parent_key !== null) {
            const parentFolderPath = await getFolderPath(folder.parent_key);
            folderPath = `${parentFolderPath}/${folder.name}`;
        } else {
            // If folder is the root folder, exclude its name from the path
            folderPath = '';
        }

        return folderPath;
    } catch (error) {
        console.error('Error fetching folder path from database:', error);
        throw error;
    }
};



export const getFilesFromDatabase = async (folderId: number, userId: number) => {
    try {
        // Fetch files associated with the specified folderId and userId
        // console.log(folderId); // folderId
        // Get only owner file and only folder owner file and file share with me 

        const [files] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM Files 
            WHERE folder_id = ? 
            AND (
                -- Files owned by the user
                created_by = ?
                -- Files shared with the user
                OR EXISTS (
                    SELECT 1 FROM Shares 
                    WHERE data_id = Files._id 
                    AND type = 1 
                    AND receive_id = ?
                )
                -- Files in folders owned by the user
                OR EXISTS (
                    SELECT 1 FROM Folders 
                    JOIN Shares 
                    ON Shares.data_id = Folders._id 
                    WHERE Folders._id = ? 
                    AND Shares.type = 0 
                    AND Shares.receive_id = ?
                )
            )`,
            [folderId, userId, userId, folderId, userId]
        );
        // console.log(files);

        // Return the fetched files
        return files as File[];
    } catch (error) {
        console.error('Error fetching files from database:', error);
        throw error;
    }
};


export const checkAccessThroughShares = async (folderId: number, userId: number): Promise<AccessStatus> => {
    try {
        // Query the Shares table to check if there are any records indicating access to the folder
        const [shareRecords] = await pool.query<RowDataPacket[]>(
            'SELECT role FROM Shares WHERE data_id = ? AND type = 0 AND receive_id = ? AND role = 0',
            [folderId, userId]
        );

        // If there are share records, the user has access
        if (shareRecords.length > 0 ) {
            return { status: true, role: shareRecords[0].role };
        }

        // Fetch the parent_key of the current folder
        const [parentFolder] = await pool.query<RowDataPacket[]>(
            'SELECT parent_key FROM Folders WHERE _id = ?',
            [folderId]
        );
        
        // If the parent_key is null, we've reached the root folder and haven't found any access
        if (!parentFolder || parentFolder.length === 0 || parentFolder[0].parent_key === null) {
            return { status: false };
        }
        // Recursively check the parent folder
        return await checkAccessThroughShares(parentFolder[0].parent_key, userId);
    } catch (error) {
        console.error('Error checking access through shares:', error);
        throw error;
    }
};
