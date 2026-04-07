import { REFRESH_TOKEN_REPOSITORY } from '@application/auth/refresh-token-repository.token';
import { TOKEN_GENERATOR } from '@application/auth/token-generator.token';
import { BARBER_REPOSITORY } from '@application/barber/barber-repository.token';
import { RESERVATION_REPOSITORY } from '@application/reservation/reservation-repository.token';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import { USER_REPOSITORY } from '@application/user/user-repository.token';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './auth/jwt.strategy';
import { JwtTokenGenerator } from './auth/jwt-token.generator';
import { RefreshTokenDrizzleRepository } from './auth/refresh-token.drizzle-repository';
import { BarberDrizzleRepository } from './barber/barber.drizzle-repository';
import { DatabaseModule } from './database/database.module';
import { ReservationDrizzleRepository } from './reservation/reservation.drizzle-repository';
import { Argon2PasswordHasher } from './user/argon2-password-hasher';
import { UserDrizzleRepository } from './user/user.drizzle-repository';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserDrizzleRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: BARBER_REPOSITORY,
      useClass: BarberDrizzleRepository,
    },
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationDrizzleRepository,
    },
    {
      provide: TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenDrizzleRepository,
    },
    JwtStrategy,
  ],
  exports: [
    USER_REPOSITORY,
    PASSWORD_HASHER,
    BARBER_REPOSITORY,
    RESERVATION_REPOSITORY,
    TOKEN_GENERATOR,
    REFRESH_TOKEN_REPOSITORY,
  ],
})
export class InfrastructureModule {}
