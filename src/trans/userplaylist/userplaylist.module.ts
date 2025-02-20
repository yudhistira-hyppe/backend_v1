import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Userplaylist, UserplaylistSchema, VPlay, VPlaySchema } from './schemas/userplaylist.schema';
import { UserplaylistController } from './userplaylist.controller';
import { UserplaylistService } from './userplaylist.service';
import { UtilsModule } from '../../utils/utils.module';

@Module({

    imports: [
        ConfigModule.forRoot(),
        UtilsModule,
        MongooseModule.forFeature([{ name: Userplaylist.name, schema: UserplaylistSchema }], 'SERVER_FULL'),
        MongooseModule.forFeature([{ name: VPlay.name, schema: VPlaySchema }], 'SERVER_FULL')
    ],
    controllers: [UserplaylistController],
    exports: [UserplaylistService],
    providers: [UserplaylistService],
})
export class UserplaylistModule { }