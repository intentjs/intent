import { configNamespace } from '@intentjs/core/config';

export default configNamespace('auth', () => ({
  /**
   * -----------------------------------------------------
   * JWT SECRET
   * -----------------------------------------------------
   *
   * This value is the secret of the JWT token.
   */
  secret: process.env.JWT_SECRET,

  /**
   * -----------------------------------------------------
   * JWT TTL
   * -----------------------------------------------------
   *
   * This value determines the life time of the jwt token.
   */
  ttl: process.env.JWT_TTL || '3h',

  /**
   * Length of the OTP generated on password reset.
   */
  otpLength: 6,

  /**
   * Expiry of the OTP in seconds
   */
  otpExpiry: 600,
}));
