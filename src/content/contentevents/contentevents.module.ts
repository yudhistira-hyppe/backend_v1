import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContenteventsService } from './contentevents.service';
import { ContenteventsController } from './contentevents.controller';
import { ConfigModule } from '@nestjs/config';
import { Contentevents, ContenteventsSchema } from './schemas/contentevents.schema';
import { UtilsModule } from '../../utils/utils.module';
import { InsightsModule } from '../insights/insights.module';
import { PostDisqusModule } from '../disqus/post/postdisqus.module';
import { InsightlogsModule } from '../insightlogs/insightlogs.module';
import { UserAdsModule } from '../../trans/userads/userads.module';
import { DisquscontactsModule } from '../disquscontacts/disquscontacts.module';
import { DisquslogsModule } from '../disquslogs/disquslogs.module';
import { DisqusContentEventModule } from './discus/disqusdisquscontentevent.module';
import { DisqusContentEventController } from './discus/disquscontentevent.controller';
import { ReactionsRepoModule } from '../../infra/reactions_repo/reactions_repo.module';
import { FriendListModule } from '../friend_list/friend_list.module';
import { UserbasicsModule } from 'src/trans/userbasics/userbasics.module';
import { NewpostsModule } from '../newposts/newposts.module';
import { UserchallengesModule } from 'src/trans/userchallenges/userchallenges.module';
import { ChallengeModule } from 'src/trans/challenge/challenge.module';
import { TagCountModule } from 'src/content/tag_count/tag_count.module';

@Module({
    imports: [
        TagCountModule,
        UserchallengesModule,
        ChallengeModule,
        NewpostsModule,
        ReactionsRepoModule,
        DisqusContentEventModule,
        DisquslogsModule,
        DisquscontactsModule,
        InsightlogsModule,
        PostDisqusModule,
        InsightsModule,
        UtilsModule,
        UserbasicsModule,
        FriendListModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Contentevents.name, schema: ContenteventsSchema }], 'SERVER_FULL')
    ],
    controllers: [ContenteventsController,],
    providers: [ContenteventsService, DisqusContentEventController],
    exports: [ContenteventsService],
})
export class ContenteventsModule { }
