import { randomUUID } from "node:crypto";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { generateKeyPair, SignJWT } from "jose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JwtTokenVerifier } from "../../src/modules/auth/infrastructure/jwt-token-verifier.js";
import { createRealTestUser, deleteRealTestUser, type RealTestUser } from "../support/supabase-test-auth.js";

describe("JwtTokenVerifier (crypto real vía JWKS, sin mocks)", () => {
  let verifier: JwtTokenVerifier;
  let realUser: RealTestUser;

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
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            }),
          ],
        }),
      ],
      providers: [JwtTokenVerifier],
    }).compile();

    verifier = moduleRef.get(JwtTokenVerifier);
    realUser = await createRealTestUser("jwt-verifier");
  });

  afterAll(async () => {
    await deleteRealTestUser(realUser.id);
  });

  it("verifica un access token real emitido por Supabase Auth (login real)", async () => {
    await expect(verifier.verify(realUser.accessToken)).resolves.toEqual({
      sub: realUser.id,
      email: realUser.email,
    });
  });

  it("rechaza un token firmado con una clave que no está en el JWKS del proyecto", async () => {
    const { privateKey } = await generateKeyPair("ES256");
    const untrustedToken = await new SignJWT({ email: "attacker@example.com" })
      .setProtectedHeader({ alg: "ES256", kid: "clave-no-registrada-en-supabase" })
      .setSubject(randomUUID())
      .setAudience("authenticated")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);

    await expect(verifier.verify(untrustedToken)).rejects.toThrow(UnauthorizedException);
  });

  it("rechaza un token malformado", async () => {
    await expect(verifier.verify("no-es-un-jwt")).rejects.toThrow(UnauthorizedException);
  });
});
