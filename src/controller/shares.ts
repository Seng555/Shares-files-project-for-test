import { FieldPacket, QueryResult, ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../util/db";
import { checkAccessThroughShares } from "./files";

export const createShareInDatabase = async (input: CreateShareInput, userId: number) => {
  try {
    let role: number = input.role;
    if (input.type === 0) {
       role = 1;
      // Check if the user is the owner of the folder
      const [folder] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM Folders WHERE _id = ? AND created_by = ?',
        [input.data_id, userId]
      );

      if (!folder || folder.length === 0) {
        // If the user is not the owner, check access permissions through shares
        const hasAccess = await checkAccessThroughShares(input.data_id, userId);
        if (!hasAccess.status) {
          throw new Error('Access denied');
        }
      }
    } else if (input.type === 1) {
      role = 1;
      // Check if the user has a share record for the file indicating access
      const [shareRecords] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM Shares WHERE data_id = ? AND type = 1 AND receive_id = ?',
        [input.data_id, userId]
      );

      if (!shareRecords || shareRecords.length === 0) {
        // If there are no share records, check access permissions through shares
        const hasAccess = await checkAccessThroughShares(input.data_id, userId);
        if (!hasAccess.status) {
          throw new Error('Access denied');
        }
      }
    }

    // Check if the share already exists
    const [existingShare]: [RowDataPacket[], FieldPacket[]] = await pool.query(
      'SELECT * FROM Shares WHERE data_id = ? AND created_by = ? AND receive_id = ?',
      [input.data_id, userId, input.receive_id]
    );

    // Update the update_date for the existing share if it exists
    if (existingShare.length > 0) {
      await pool.query(
        'UPDATE Shares SET update_date = ? WHERE _id = ?',
        [new Date(), existingShare[0]._id]
      );
      throw new Error('Share already exists');
    }

    // Insert new share into the database
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Shares (data_id, type, created_by, receive_id, created_date, update_date, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [input.data_id, input.type, userId, input.receive_id, new Date(), new Date(), role]
    );

    return {
      success: true,
      message: 'Successfully',
      insertId: result.insertId,
    };
  } catch (error) {
    console.error('Error creating share in database:', error);
    throw error;
  }
};

export const getAllSharesForUser = async (userId: number) => {
  try {
    // Execute the SQL query to retrieve all shares for the user
    const [shares]: [RowDataPacket[], FieldPacket[]] = await pool.query(
      `
          SELECT 
              Shares._id, 
              Shares.data_id,
              Shares.type,
              Shares.created_by, 
              Shares.receive_id,
              Shares.created_date,
              Shares.update_date,
              Shares.role,
              CASE
                  WHEN Shares.type = 0 THEN Folders.name
                  WHEN Shares.type = 1 THEN Files.name
                  ELSE NULL
              END AS name
          FROM Shares
          LEFT JOIN Folders ON Shares.type = 0 AND Shares.data_id = Folders._id
          LEFT JOIN Files ON Shares.type = 1 AND Shares.data_id = Files._id
          WHERE Shares.created_by = ?
          `,
      [userId]
    );
    console.log(shares);

    return shares;
  } catch (error) {
    console.error('Error retrieving shares for user:', error);
    throw error;
  }
};

export const getAllSharesForMe = async (userId: number) => {
  try {
    // Execute the SQL query to retrieve all shares for the user where they are the receiver
    const [shares]: [RowDataPacket[], FieldPacket[]] = await pool.query(
      `
        SELECT 
            Shares._id, 
            Shares.data_id,
            Shares.type,
            Shares.created_by, 
            Shares.receive_id,
            Shares.created_date,
            Shares.update_date,
            Shares.role,
            CASE
                WHEN Shares.type = 0 THEN Folders.name
                WHEN Shares.type = 1 THEN Files.name
                ELSE NULL
            END AS name
        FROM Shares
        LEFT JOIN Folders ON Shares.type = 0 AND Shares.data_id = Folders._id
        LEFT JOIN Files ON Shares.type = 1 AND Shares.data_id = Files._id
        WHERE Shares.receive_id = ?
        `,
      [userId]
    );
    //console.log(shares);

    return shares;
  } catch (error) {
    console.error('Error retrieving shares for user:', error);
    throw error;
  }
};

export const deleteShare = async (shareId: number, userId: number) => {
  try {
    // Check if the share exists and the user has permission to delete it
    const [existingShare]: [RowDataPacket[], FieldPacket[]] = await pool.query(
      'SELECT * FROM Shares WHERE _id = ?',
      [shareId]
    );

    if (existingShare.length === 0) {
      throw new Error('Share not found or you do not have permission to delete it');
    }
    //console.log(existingShare, userId, (existingShare[0].receive_id == userId && existingShare[0].role == 1));

    // throw new Error('Share not found or you do not have permission to delete it');

    if (existingShare[0].receive_id == userId && existingShare[0].role == 1) {
      throw new Error('Access denied');
    } else if (existingShare[0].receive_id == userId && existingShare[0].role == 0) {
      // Execute the SQL query to delete the share
      const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(
        'DELETE FROM Shares WHERE _id = ?',
        [shareId]
      );
      return {
        success: true,
        message: 'Share successfully deleted',
        affectedRows: result.affectedRows,
      };
    } else if (existingShare[0].created_by == userId) {
      // Execute the SQL query to delete the share
      const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(
        'DELETE FROM Shares WHERE _id = ?',
        [shareId]
      );
      return {
        success: true,
        message: 'Share successfully deleted',
        affectedRows: result.affectedRows,
      };
    } else {
      return {
        success: false,
        message: 'Something went wrong!',
      };
    }
  } catch (error) {
    console.error('Error deleting share from database:', error);
    throw error;
  }
};

