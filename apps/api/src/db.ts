import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "PassworD",
  database: "garageos",
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });