import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { integer } from 'aws-sdk/clients/lightsail';
import mongoose, { Document } from 'mongoose';
import { Long } from "mongodb";

export type MediastreamingDocument = Mediastreaming & Document ;

@Schema({ collection: 'mediastreaming' })
export class Mediastreaming{
    _id: mongoose.Types.ObjectId;
    @Prop()
    title: String;
    @Prop()
    userId: mongoose.Types.ObjectId;
    @Prop()
    expireTime: Long;
    @Prop()
    startLive: String;
    @Prop()
    endLive: String;
    @Prop()
    status: boolean;
    @Prop()
    view: any[];
    @Prop()
    comment: any[];
    @Prop()
    like: any[];
    @Prop()
    share: any[];
    @Prop()
    follower: any[];
    @Prop()
    urlStream: String;
    @Prop()
    urlIngest: String;
    @Prop()
    feedBack: String;
    @Prop()
    createAt: String;
    @Prop()
    feedback: number;
    @Prop()
    pause: boolean;
    @Prop()
    kick: any[];
    @Prop()
    commentDisabled: boolean;
}
export const MediastreamingSchema = SchemaFactory.createForClass(Mediastreaming);