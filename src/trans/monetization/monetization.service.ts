import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monetize, MonetizeDocument } from './schemas/monetization.schema';
import { ConfigService } from '@nestjs/config';
import { OssContentPictService } from 'src/content/posts/osscontentpict.service';
import { PostContentService } from 'src/content/posts/postcontent.service';
import { UtilsService } from 'src/utils/utils.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { LogapisService } from '../logapis/logapis.service';
import mongoose from 'mongoose';
const sharp = require('sharp');

@Injectable()
export class MonetizationService {
    constructor(
        @InjectModel(Monetize.name, 'SERVER_FULL')
        private readonly monetData: Model<MonetizeDocument>,
        private readonly configService: ConfigService,
        private readonly ossContentPictService: OssContentPictService,
        private readonly postContentService: PostContentService,
        private readonly utilsService: UtilsService,
        private readonly UserbasicnewService: UserbasicnewService,
        private readonly LogAPISS: LogapisService,
    ) { }

    async find(): Promise<Monetize[]> {
        return this.monetData.find().exec();
    }

    async findOne(id: string): Promise<Monetize> {
        return this.monetData.findOne({ _id: id }).exec();
    }

    async createCoin(file: Express.Multer.File, request: any): Promise<Monetize> {
        let id = new mongoose.Types.ObjectId();
        let image_information = await sharp(file.buffer).metadata();
        let extension = image_information.format;
        let now = await this.utilsService.getDateTimeString();

        let filename = id + "." + extension;
        let path_file = "images/coin/" + id + "/" + filename;

        let file_upload = await this.postContentService.generate_upload_noresize(file, extension);
        let upload_file_upload = await this.uploadOss(file_upload, path_file);

        let url_filename = "";

        if (upload_file_upload != undefined) {
            if (upload_file_upload.res != undefined) {
                if (upload_file_upload.res.statusCode != undefined) {
                    if (upload_file_upload.res.statusCode == 200) {
                        url_filename = upload_file_upload.res.requestUrls[0];
                    }
                }
            }
        }
        let createCoinDto = {
            _id: id,
            name: request.name,
            item_id: request.item_id,
            package_id: request.package_id,
            price: Number(request.price),
            amount: Number(request.amount),
            stock: Number(request.stock),
            thumbnail: url_filename,
            createdAt: now,
            updatedAt: now,
            type: request.type,
            used_stock: 0,
            last_stock: Number(request.stock),
            active: Boolean(request.active),
            status: Boolean(request.status)
        }
        return this.monetData.create(createCoinDto);
    }

    async createCredit(header: any, inputdata: any) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var url = inputdata.get("Host") + inputdata.originalUrl;
        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_body = JSON.parse(JSON.stringify(inputdata));

        if (request_body.audiens == "EXCLUSIVE" && (request_body.audiens_user == null || request_body.audiens_user == undefined)) {
            throw new BadRequestException("Target user field must required");
        }

        var mongo = require('mongoose');
        var insertdata = new Monetize();
        insertdata._id = new mongo.Types.ObjectId();
        insertdata.name = request_body.name;
        insertdata.package_id = request_body.package_id;
        insertdata.item_id = request_body.item_id;
        insertdata.description = request_body.description;
        insertdata.audiens = request_body.audiens;
        insertdata.createdAt = await this.utilsService.getDateTimeString();
        insertdata.updatedAt = await this.utilsService.getDateTimeString();
        insertdata.active = ((request_body.active == "true" || request_body.active == true) ? true : false);
        insertdata.status = ((request_body.status == "true" || request_body.status == true) ? true : false);
        insertdata.price = Number(request_body.price);
        insertdata.stock = Number(request_body.stock);
        insertdata.amount = Number(request_body.amount);
        insertdata.last_stock = Number(request_body.stock);
        insertdata.used_stock = 0;
        insertdata.type = 'CREDIT';

        if (request_body.audiens == "EXCLUSIVE") {
            this.insertmultipleTarget(insertdata, request_body.audiens_user);
        }

        await this.monetData.create(insertdata);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);

        return {
            response_code: 202,
            message: {
                "info": ["The process successful"],
            }
        }
    }

    async insertmultipleTarget(setdata: any, setaudiens: string) {
        var mongo = require('mongoose');
        var insertaudiens = [];
        if (setaudiens == 'ALL') {
            var totaldata = await this.UserbasicnewService.getcount();
            var setpagination = parseInt(totaldata[0].totalpost) / 200;
            var ceksisa = (parseInt(totaldata[0].totalpost) % 200);
            if (ceksisa > 0 && ceksisa < 5) {
                setpagination = setpagination + 1;
            }

            for (var looppagination = 0; looppagination < setpagination; looppagination++) {
                var getalluserbasic = await this.UserbasicnewService.getuser(looppagination, 200);

                for (var loopuser = 0; loopuser < getalluserbasic.length; loopuser++) {
                    insertaudiens.push(getalluserbasic[loopuser]._id);
                }
            }
        }
        else {
            var target_user = setaudiens.split(",");
            for (var loopP = 0; loopP < target_user.length; loopP++) {
                var setpartisipan = new mongo.Types.ObjectId(target_user[loopP]);
                insertaudiens.push(setpartisipan);
            }
        }

        setdata.audiens_user = insertaudiens;
        await this.monetData.findByIdAndUpdate(setdata._id.toString(), setdata);
    }


    async uploadOss(buffer: Buffer, path: string) {
        var result = await this.ossContentPictService.uploadFileBuffer(buffer, path);
        return result;
    }

    async listAllCoin(skip: number, limit: number, descending: boolean, type?: string, name?: string, dateFrom?: string, dateTo?: string, stockFrom?: number, stockTo?: number, status?: boolean, audiens_type?: string, item_id?: string) {

        let order = descending ? -1 : 1;
        let pipeline = [];
        pipeline.push({
            "$match": {
                "type": type
            }
        });
        pipeline.push({
            "$sort":
            {
                'updatedAt': order
            }
        });
        if (name && name !== undefined) {
            pipeline.push({
                "$match": {
                    "name": new RegExp(name, "i")
                }
            })
        }
        if (item_id && item_id !== undefined) {
            pipeline.push({
                "$match": {
                    "item_id": new RegExp(item_id, "i")
                }
            })
        }
        if (dateFrom && dateFrom !== undefined) {
            pipeline.push({
                "$match": {
                    "createdAt": {
                        $gte: dateFrom + " 00:00:00"
                    }
                }
            })
        }
        if (dateTo && dateTo !== undefined) {
            pipeline.push({
                "$match": {
                    "createdAt": {
                        $lte: dateTo + " 23:59:59"
                    }
                }
            })
        }
        if (stockFrom && stockFrom !== undefined) {
            pipeline.push({
                "$match": {
                    "stock": {
                        $gte: stockFrom
                    }
                }
            })
        }
        if (stockTo && stockTo !== undefined) {
            pipeline.push({
                "$match": {
                    "stock": {
                        $lte: stockTo
                    }
                }
            })
        }
        if (status !== null && status !== undefined) {
            pipeline.push({
                "$match": {
                    "status": status
                }
            })
        }
        if (audiens_type && audiens_type !== undefined) {
            pipeline.push({
                "$match": {
                    "audiens": audiens_type
                }
            })
        }
        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }

        var data = await this.monetData.aggregate(pipeline);
        return data;
    }

    async deactivate(id: string) {
        return this.monetData.findByIdAndUpdate(id, { status: false, updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
    }

    async activate(id: string) {
        return this.monetData.findByIdAndUpdate(id, { status: true, updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
    }

    async delete(id: string) {
        return this.monetData.findByIdAndUpdate(id, { active: false, updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
    }
}
