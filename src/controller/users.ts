import { NoContentError } from "../middleware/err";
import { pool } from "../util/db";
import { validate as validateEmail } from 'email-validator'; // Import email-validator library
import { generateToken } from "../util/jwt";
import { ResultSetHeader } from "mysql2";

export const getUsersFromDatabase = async () => {
    try {
        // Get a connection from the pool
        const connection = await pool.getConnection();
        // Execute the query to fetch users
        const [rows] = await connection.query<ResultSetHeader>('SELECT * FROM `Users`');
        //console.log(rows);
        
        // Release the connection back to the pool
        connection.release();
        // Return the response object
        return rows;
    } catch (error) {
        console.error('Error fetching users from database:', error);
        throw error; // Rethrow the error for handling higher up the call stack
    }
};
export const UserLogin = async (email: string) => {
    try {
        const connection = await pool.getConnection();
        // Execute the query to fetch the user by ID
        const [rows] = await connection.query<ResultSetHeader>('SELECT * FROM Users WHERE email = ?', [email.toLocaleLowerCase()]);
        // Release the connection back to the pool
        connection.release();
        // Check if any rows were returned
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new NoContentError('No content found'); // Throw a custom error
        }
        // Return the fetched user along with the default response
        const user = rows[0] as User; // Assuming the query returns only one user or undefined if no user found
        
        return  {
            success: true, // Assuming the user is found, set success to true
            token: generateToken(user) // Set the token value
          };
    } catch (error) {
        console.error('Error fetching user from database:', error);
        throw error; // Rethrow the error for handling higher up the call stack
    }
};
// Function to create a new user in the MySQL database
export const createUserInDatabase = async (name: string, email: string) => {
    try {
        if (!validateEmail(email)) {
            throw new Error('Invalid email address');
        }
        // Get a connection from the pool
        const connection = await pool.getConnection();

        // Check if the email address already exists in the database
        const [existingUsers] = await connection.query<ResultSetHeader>('SELECT * FROM Users WHERE email = ?', [email.toLocaleLowerCase()]);
        // If an existing user with the same email address is found, throw an error
        if (!Array.isArray(existingUsers) || existingUsers.length > 0) {
            throw new Error('Email address already exists');
        }

        // Execute the INSERT query to create the new user
        await connection.query('INSERT INTO Users (name, email) VALUES (?, ?)', [name, email.toLocaleLowerCase()]);

        // Release the connection back to the pool
        connection.release();

        // Return a success message or any relevant data
        return { success: true, message: 'User created successfully' };
    } catch (error) {
        console.error('Error creating user in database:', error);
        throw error; // Rethrow the error for handling higher up the call stack
    }
};