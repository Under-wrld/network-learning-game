import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, type JWTVerifyGetKey, jwtVerify } from "jose";
import type { Env } from "../../../config/env.schema.js";
import type { TokenVerifier, VerifiedTokenClaims } from "../domain/token-verifier.js";

interface SupabaseAccessTokenPayload {
  sub?: string;
  email?: string;
}

/**
 * Los access tokens de Supabase Auth de este proyecto se firman con ES256
 * (clave asimétrica), no con un secreto compartido HS256 — confirmado
 * decodificando el header de un token real emitido por un login real
 * (alg: ES256), no asumido. La verificación se hace contra el JWKS público
 * del proyecto, tal como recomienda Supabase para claves asimétricas. Ver
 * DECISIONS.md para el detalle de cómo se descubrió el error de la
 * implementación HS256 original.
 */
@Injectable()
export class JwtTokenVerifier implements TokenVerifier {
  private jwks: JWTVerifyGetKey | undefined;

  constructor(private readonly configService: ConfigService<Env, true>) {}

  private getJwks(): JWTVerifyGetKey {
    if (!this.jwks) {
      const supabaseUrl = this.configService.get("NEXT_PUBLIC_SUPABASE_URL", { infer: true });
      this.jwks = createRemoteJWKSet(new URL("/auth/v1/.well-known/jwks.json", supabaseUrl));
    }
    return this.jwks;
  }

  async verify(token: string): Promise<VerifiedTokenClaims> {
    let payload: SupabaseAccessTokenPayload;
    try {
      const result = await jwtVerify(token, this.getJwks(), { audience: "authenticated" });
      payload = result.payload as SupabaseAccessTokenPayload;
    } catch {
      throw new UnauthorizedException("Token inválido o expirado");
    }

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException("El token no contiene sub/email");
    }

    return { sub: payload.sub, email: payload.email };
  }
}
