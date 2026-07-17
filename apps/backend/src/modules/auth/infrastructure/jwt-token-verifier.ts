import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import jwt from "jsonwebtoken";
import type { Env } from "../../../config/env.schema.js";
import type { TokenVerifier, VerifiedTokenClaims } from "../domain/token-verifier.js";

interface SupabaseAccessTokenPayload extends jwt.JwtPayload {
  email?: string;
}

/**
 * Verifica access tokens emitidos por Supabase Auth. Supabase firma estos
 * tokens (y las API keys anon/service_role) con HS256 usando el JWT Secret
 * del proyecto — confirmado inspeccionando el header de las keys reales del
 * proyecto (alg: HS256), no asumido. Ver DECISIONS.md.
 */
@Injectable()
export class JwtTokenVerifier implements TokenVerifier {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  verify(token: string): VerifiedTokenClaims {
    const secret = this.configService.get("SUPABASE_JWT_SECRET", { infer: true });

    let decoded: SupabaseAccessTokenPayload;
    try {
      decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as SupabaseAccessTokenPayload;
    } catch {
      throw new UnauthorizedException("Token inválido o expirado");
    }

    if (!decoded.sub || !decoded.email) {
      throw new UnauthorizedException("El token no contiene sub/email");
    }

    return { sub: decoded.sub, email: decoded.email };
  }
}
