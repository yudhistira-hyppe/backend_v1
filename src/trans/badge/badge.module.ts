import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
import { OssModule } from 'src/stream/oss/oss.module';
import { MongooseModule } from '@nestjs/mongoose';
import { badge, badgeDocument, badgeSchema } from './schemas/badge.schema';
import { ConfigModule } from '@nestjs/config';
import { Config } from 'aws-sdk';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports:[
    ConfigModule.forRoot(),
    OssModule,
    LogapisModule,
    UtilsModule,
    MongooseModule.forFeature([{ name:badge.name, schema: badgeSchema }], 'SERVER_FULL')
  ],
  controllers: [BadgeController],
  providers: [BadgeService],
  exports: [BadgeService]
})
export class BadgeModule {}
