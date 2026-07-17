import path from "node:path";
import { fileURLToPath } from "node:url";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./config/env.schema.js";
import { AuthModule } from "./modules/auth/auth.module.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Única fuente de verdad de env vars: el .env de la raíz del monorepo.
      envFilePath: path.resolve(__dirname, "../../../.env"),
      validate: validateEnv,
    }),
    AuthModule,
  ],
})
export class AppModule {}
