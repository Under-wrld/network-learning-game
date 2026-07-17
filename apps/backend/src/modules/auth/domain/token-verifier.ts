export interface VerifiedTokenClaims {
  sub: string;
  email: string;
}

/** Puerto de verificación de tokens; la implementación real vive en infrastructure/. */
export interface TokenVerifier {
  verify(token: string): VerifiedTokenClaims;
}

export const TOKEN_VERIFIER = Symbol("TOKEN_VERIFIER");
