import { UserModel } from '#models/userModel';
import { UserDbRepository } from '#repositories/userDbRepository';
import { generateOtp } from '#utils/index';
import {
  ChangePasswordUsingTokenDto,
  LoginDto,
  RegisterDto,
  RequestPasswordChangeOtpDto,
  VerifyEmailDto,
  VerifyOtpForChangePasswordDto,
} from '#validators/auth';
import { compareSync, hashSync } from 'bcrypt';
import { ulid } from 'ulid';
import JWT from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { Inject } from '@intentjs/core';
import { Injectable } from '@intentjs/core';
import { ConfigService } from '@intentjs/core/config';
import {
  GenericException,
  Unauthorized,
  ValidationFailed,
} from '@intentjs/core/errors';
import { Mail } from '@intentjs/core/mail';
import { Cache } from '@intentjs/core/cache';
import { MailMessage } from '@intentjs/core/mail';

const { sign, verify } = JWT;
@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    @Inject('USER_DB_REPO') private users: UserDbRepository,
  ) {}

  async register(dto: RegisterDto): Promise<UserModel> {
    const existingUser = await this.users.firstWhere(
      { email: dto.email },
      false,
    );

    if (existingUser) {
      throw new ValidationFailed({
        email: ['Email is already used by another account!'],
      });
    }

    const user = await this.users.create({
      id: ulid(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashSync(dto.password, 10),
      passwordChangedAt: new Date(),
    });

    user.token = await this.makeToken({
      sub: user.id,
      env: this.config.get('app.env'),
      emailVerifiedAt: user.emailVerifiedAt,
      passwordChangedAt: user.passwordChangedAt,
    });

    return user;
  }

  async login(dto: LoginDto): Promise<UserModel> {
    const user = await this.users.firstWhere({ email: dto.email });

    if (!compareSync(dto.password, user.password)) {
      throw new Unauthorized();
    }

    user.token = await this.makeToken({
      sub: user.id,
      env: this.config.get('app.env'),
      emailVerifiedAt: user.emailVerifiedAt,
      passwordChangedAt: user.passwordChangedAt,
    });

    return user;
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const payload = await this.verifyToken(dto.token);
    if (payload.email != dto.email) {
      throw new GenericException(
        'Oops! looks like verification was not requested for this email.',
      );
    }

    const user = await this.users.firstWhere({ email: dto.email });
    await this.users.updateWhere(
      { email: user.email },
      { emailVerifiedAt: new Date() },
    );
  }

  async requestPasswordChangeOtp(
    dto: RequestPasswordChangeOtpDto,
  ): Promise<void> {
    const user = await this.users.firstWhere({ email: dto.email }, false);
    if (!user) {
      throw new ValidationFailed({
        email: ['Cannot find any user with this email'],
      });
    }

    const otp = generateOtp(this.config.get<string>('auth.otpLength'));

    /**
     * Save the OTP in cache.
     */
    const cacheKey = Cache.genKey({
      type: 'PASSWORD_CHANGE_OTP',
      userEmail: dto.email,
    });

    await Cache.store().set(
      cacheKey,
      otp,
      this.config.get<string>('auth.otpExpiry'),
    );

    const mail = MailMessage.init()
      .greeting('Hey there')
      .line('Please find below your OTP for resetting your password!')
      .inlineCode(otp);

    await Mail.init().to(dto.email).send(mail);
  }

  async verifyOtpForPasswordChange(
    dto: VerifyOtpForChangePasswordDto,
  ): Promise<string> {
    const cacheKey = Cache.genKey({
      type: 'PASSWORD_CHANGE_OTP',
      userEmail: dto.email,
    });
    const otpFromCache = await Cache.store().get(cacheKey);
    console.log(otpFromCache);
    if (!otpFromCache) {
      throw new ValidationFailed({
        otp: [
          'Oops! Either the given OTP was never requested for this email or it has expired!',
        ],
      });
    }

    if (otpFromCache !== dto.otp) {
      throw new ValidationFailed({
        otp: ['Invalid OTP entered!'],
      });
    }

    const payload = { email: dto.email, purpose: 'CHANGE_PASSWORD' };
    const token = sign(payload, this.config.get<string>('auth.secret'), {
      issuer: this.config.get<string>('app.url'),
      expiresIn: '15m',
    });

    return token;
  }

  async changePassword(dto: ChangePasswordUsingTokenDto): Promise<void> {
    const payload = await this.verifyToken(dto.token);

    await this.users.updateWhere(
      { email: payload.email },
      {
        password: hashSync(dto.password, 10),
        passwordChangedAt: new Date(),
      },
    );
  }

  async verifyToken(token: string): Promise<Record<string, any>> {
    const payload = (await verify(
      token,
      this.config.get('auth.secret') as string,
      { issuer: this.config.get('app.url') as string },
    )) as JwtPayload;

    return payload;
  }

  async makeToken(payload: Record<string, any>): Promise<string> {
    return sign(payload, this.config.get('auth.secret') as string, {
      issuer: this.config.get('app.url') as string,
      expiresIn: this.config.get('auth.ttl') as string,
    });
  }
}
