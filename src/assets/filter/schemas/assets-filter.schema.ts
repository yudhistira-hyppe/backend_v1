import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AssetsFilterDocument = AssetsFilter & Document;

@Schema({ collection: 'assetsfilter' })
export class AssetsFilter {
    _id: mongoose.Types.ObjectId;
    @Prop()
    namafile: string;
    @Prop()
    descFile: string;
    @Prop()
    iconFile: string;

    @Prop()
    fileAssetName: String;
    @Prop()
    fileAssetBasePath: String;
    @Prop()
    fileAssetUri: String;

    @Prop()
    mediaName: String;
    @Prop()
    mediaBasePath: String;
    @Prop()
    mediaUri: String;

    @Prop()
    mediaThumName: String;
    @Prop()
    mediaThumBasePath: String;
    @Prop()
    mediaThumUri: String;

    @Prop()
    status: boolean;
}
export const AssetsFilterSchema = SchemaFactory.createForClass(AssetsFilter);