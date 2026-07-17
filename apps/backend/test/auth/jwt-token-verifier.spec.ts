import { UnauthorizedException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import jwt from "jsonwebtoken";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JwtTokenVerifier } from "../../src/modules/auth/infrastructure/jwt-token-verifier.js";

const TEST_SECRET = "vitest-jwt-token-verifier-test-secret";

describe("JwtTokenVerifier (crypto real, sin mocks)", () => {
  let verifier: JwtTokenVerifier;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [
            () => ({
              NODE_ENV: "test",
              API_PORT: 3001,
              DATABASE_URL: "postgresql://unused-in-this-suite",
              SUPABASE_JWT_SECRET: TEST_SECRET,
            }),
          ],
        }),
      ],
      providers: [JwtTokenVerifier],
    }).compile();

    verifier = moduleRef.get(JwtTokenVerifier);
  });

  afterAll(async () => {
    // nada que limpiar: este suite no toca la base de datos.
  });

  it("verifica un token real firmado con el secreto correcto", () => {
    const token = jwt.sign({ sub: "user-123", email: "student@example.com" }, TEST_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });

    expect(verifier.verify(token)).toEqual({ sub: "user-123", email: "student@example.com" });
  });

  it("rechaza un token firmado con un secreto distinto", () => {
    const token = jwt.sign({ sub: "user-123", email: "x@example.com" }, "secreto-incorrecto", {
      algorithm: "HS256",
    });

    expect(() => verifier.verify(token)).toThrow(UnauthorizedException);
  });

  it("rechaza un token expirado", () => {
    const token = jwt.sign({ sub: "user-123", email: "x@example.com" }, TEST_SECRET, {
      algorithm: "HS256",
      expiresIn: -10,
    });

    expect(() => verifier.verify(token)).toThrow(UnauthorizedException);
  });

  it("rechaza un token sin claim de email", () => {
    const token = jwt.sign({ sub: "user-123" }, TEST_SECRET, { algorithm: "HS256" });

    expect(() => verifier.verify(token)).toThrow(UnauthorizedException);
  });

  it("rechaza un token malformado", () => {
    expect(() => verifier.verify("no-es-un-jwt")).toThrow(UnauthorizedException);
  });
});
