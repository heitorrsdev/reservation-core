import { Module } from '@nestjs/common';

import { BARBER_REPOSITORY } from '@application/barber/barber-repository.token';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import { USER_REPOSITORY } from '@application/user/user-repository.token';

import { BarberDrizzleRepository } from './barber/barber.drizzle-repository';
import { DatabaseModule } from './database/database.module';
import { Argon2PasswordHasher } from './user/argon2-password-hasher';
import { UserDrizzleRepository } from './user/user.drizzle-repository';

@Module({
  imports: [DatabaseModule],
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
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER, BARBER_REPOSITORY],
})
export class InfrastructureModule {}
