import { createUserInDatabase, UserLogin } from "../controller/users";

export const userResolvers = {
  Query: {
    login: (parent: any, { email }: { email: string }) => UserLogin(email),
  },
  Mutation: {
    register: (parent: any, { name, email }: { name: string, email: string }) => createUserInDatabase(name, email),
  },
};