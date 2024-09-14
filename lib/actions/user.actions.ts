/**
 * User Actions Module
 * 
 * This modules handles user-related actions such as sign-up and retrieving the currently logged-in user.
 * It integrates with the Appwrite service to create user accounts and manage sessions.
 */

'use server'

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient  } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";


export const signIn = async ( { email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();

    const response = await account.createEmailPasswordSession(email, password);

    return parseStringify(response);
  } catch (error) {
    console.error('Error signing in:', error);
  }
}

/**
 * Sign Up a New User
 * 
 * This function registers a new user in the Appwrite backend by creating an account
 * and an email-password-based session. It also sets a secure session cookie.
 * 
 * @param userData - The data needed to create a new user account.
 * @returns {Promise<Object | void>} - The created user account or void if an error occurs.
 */
export const signUp = async (userData: SignUpParams) => {
  try {
    // Create an admin client for privileged access to user management
    const { account } = await createAdminClient();
    const { email, password, firstName, lastName } = userData

    // Create a new user account
    const newUserAccount = await account.create(ID.unique(),email, password,`${firstName} ${lastName}`);

    // Create a session for the newly created user
    const session = await account.createEmailPasswordSession(email, password);

    // Stores the session in a secure Http-only cookie
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // Return the new user account information, parsed for JSON serialization
    return parseStringify(newUserAccount);
  } catch (error) {
    console.error('Error during sign-up:', error);
  }
}

/**
 * Get Logged-In User
 * 
 * This function fetchs the current user's account information using a valid session.
 * If no session is available or an error occurs, it returns null.
 * 
 * @returns {Promise<Object | null>} - The logged-in user's account data or null if not logged in.
 */
export async function getLoggedInUser() {
  try {
    // Create a session client ot access the logged-in user's account
    const { account } = await createSessionClient();

    // Fetch and store the acccount information as user.
    const user = await account.get();

    // Returns the user information
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}
