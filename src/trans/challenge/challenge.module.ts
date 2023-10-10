import { Module } from '@nestjs/common';
import { subChallengeService } from './subChallenge.service';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Challenge, ChallengeSchema } from './schemas/challenge.schema';
import { OssModule } from 'src/stream/oss/oss.module';
import { UtilsModule } from 'src/utils/utils.module';
import { BadgeModule } from '../badge/badge.module';
import { subChallenge, subChallengeSchema } from './schemas/subchallenge.schema';
import { Userchallenges, UserchallengesSchema } from '../userchallenges/schemas/userchallenges.schema';
import { UserchallengesModule } from '../userchallenges/userchallenges.module';
import { UserchallengesService } from '../userchallenges/userchallenges.service';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { notifChallenge, notifChallengeSchema } from './schemas/notifChallenge.schema';
import { notifChallengeService } from './notifChallenge.service';
import { UserbadgeModule } from '../userbadge/userbadge.module';
import { LogapisModule } from '../logapis/logapis.module';
import { LanguagesModule } from '../../infra/languages/languages.module';
import { PostchallengeModule } from '../postchallenge/postchallenge.module'; 
@Module({
  imports: [
    PostchallengeModule,
    LogapisModule,
    ConfigModule.forRoot(),
    OssModule,
    UserbadgeModule,
    LanguagesModule,
    UtilsModule,
    BadgeModule,
    UserchallengesModule,
    UserbasicsModule,
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: subChallenge.name, schema: subChallengeSchema },
      { name: notifChallenge.name, schema: notifChallengeSchema },
      { name: Userchallenges.name, schema: UserchallengesSchema }
    ], 'SERVER_FULL')
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService, subChallengeService, UserchallengesService, notifChallengeService],
  exports: [ChallengeService, subChallengeService, notifChallengeService],
})
export class ChallengeModule { }
