import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers, UseInterceptors, UploadedFiles, Put, NotAcceptableException } from '@nestjs/common';
import { BannerService } from './banner.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Banner } from './schemas/banner.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import mongoose from 'mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { OssService } from 'src/stream/oss/oss.service';
@Controller('api/banner')
export class BannerController {

    constructor(
        private readonly BannerService: BannerService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
        private readonly osservices: OssService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 },]))
    async create(
        @UploadedFiles() files: {
            image?: Express.Multer.File[]

        },
        @Req() request: Request,
        @Res() res,
    ) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var url = null;
        var title = null;
        var email = null;
        if (request_json["url"] !== undefined) {
            url = request_json["url"];
        } else {
            throw new BadRequestException("url required");
        }
        if (request_json["title"] !== undefined) {
            title = request_json["title"];
        } else {
            throw new BadRequestException("title required");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("email required");
        }
        if (files.image == undefined) {
            throw new BadRequestException("image required");
        }
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];
        var mongoose = require('mongoose');
        var insertdata = new Banner();
        insertdata._id = new mongoose.Types.ObjectId();

        insertdata.createdAt = timedate;
        insertdata.active = true;
        insertdata.statusTayang = false;
        insertdata.url = url;
        insertdata.title = title;
        insertdata.email = email;
        var insertbanner = files.image[0];
        var path = "images/banner/" + insertdata._id + "_banner" + "." + insertbanner.originalname.split(".").pop();
        var result = await this.osservices.uploadFile(insertbanner, path);
        var geturl = result.url;
        var konvert = geturl.replace("http", "https");
        insertdata.image = konvert;


        const messages = {
            "info": ["The process successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            await this.BannerService.create(insertdata);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": insertdata,
                "message": messages
            });
        }
        catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                "message": messagesEror
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('update')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 },]))
    async update(
        @UploadedFiles() files: {
            image?: Express.Multer.File[]

        },
        @Req() request: Request,
        @Res() res,
    ) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var id = null;
        var url = null;
        var title = null;
        var email = null;
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("id required");
        }
        if (request_json["url"] !== undefined) {
            url = request_json["url"];
        }
        if (request_json["title"] !== undefined) {
            title = request_json["title"];
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        }

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];
        var mongoose = require('mongoose');
        var insertdata = new Banner();

        insertdata.createdAt = timedate;
        insertdata.url = url;
        insertdata.title = title;
        insertdata.email = email;

        if (files.image !== undefined) {
            var insertbanner = files.image[0];
            var path = "images/banner/" + id + "_banner" + "." + insertbanner.originalname.split(".").pop();
            var result = await this.osservices.uploadFile(insertbanner, path);
            var geturl = result.url;
            var konvert = geturl.replace("http", "https");
            insertdata.image = konvert;
        }



        const messages = {
            "info": ["The process successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            await this.BannerService.update(id, insertdata);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": insertdata,
                "message": messages
            });
        }
        catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                "message": messagesEror
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('listing')
    async listing(@Request() req) {
        var keyword = null;
        var statustayang = null;
        var startdate = null;
        var enddate = null;
        var page = null;
        var limit = null;
        var sorting = null;

        var request_json = JSON.parse(JSON.stringify(req.body));
        if (request_json['ascending'] != null && request_json['ascending'] != undefined) {
            sorting = request_json['ascending'];
        }
        else {
            throw new BadRequestException("Unabled to proceed, ascending field is required");
        }

        if (request_json['page'] != null && request_json['page'] != undefined) {
            page = request_json['page'];
        }
        else {
            throw new BadRequestException("Unabled to proceed, page field is required");
        }

        if (request_json['limit'] != null && request_json['limit'] != undefined) {
            limit = request_json['limit'];
        }
        else {
            throw new BadRequestException("Unabled to proceed, limit field is required");
        }

        if (request_json['keyword'] != null && request_json['keyword'] != undefined) {
            keyword = request_json['keyword'];
        }

        if (request_json['statustayang'] != null && request_json['statustayang'] != undefined) {
            statustayang = request_json['statustayang'];
        }

        if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
            startdate = request_json["startdate"];

            var currentdate = new Date(new Date(request_json["enddate"]).setDate(new Date(request_json["enddate"]).getDate() + 1));
            var dateend = currentdate.toISOString().split("T")[0];
            enddate = dateend;
        }

        var data = await this.BannerService.listing(keyword, statustayang, startdate, enddate, page, limit, sorting);
        var totaldata = await this.BannerService.listing(keyword, statustayang, startdate, enddate, null, null, sorting);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code: 202,
            data: data,
            total: totaldata.length,
            messages: messages,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('update/statustayang')
    async updatestatusTayang(@Request() req) {
        var request_json = JSON.parse(JSON.stringify(req.body));
        if (request_json['id'] == null || request_json['id'] == undefined) {
            throw new BadRequestException("Unabled to proceed, id field required");
        }

        if (request_json['statustayang'] == null || request_json['statustayang'] == undefined) {
            throw new BadRequestException("Unabled to proceed, statustayang field required");
        }

        var id = request_json['id'];
        var statustayang = request_json['statustayang'];

        var checkexists = await this.BannerService.listing(null, true, null, null, null, null, true);
        if (statustayang == true) {
            if (checkexists.length >= 5) {
                throw new NotAcceptableException("Unabled to proceed, show banner quote already full");
            }
        }
        else{
            if (checkexists.length == 1) {
                throw new NotAcceptableException("Unabled to proceed, show banner list must exist with at least one");
            }
        }

        var updatedata = new Banner();
        updatedata.statusTayang = statustayang;

        await this.BannerService.update(id, updatedata);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code: 202,
            messages: messages,
        };
    }
    @UseGuards(JwtAuthGuard)
    @Post('/delete/:id')
    async delete(@Param('id') id: string, @Headers() headers) {
        if (id == undefined || id == "") {
            await this.errorHandler.generateBadRequestException(
                'Param id is required',
            );
        }
        await this.BannerService.updateNonactive(id);
        var response = {
            "response_code": 202,
            "messages": {
                info: ['Successfuly'],
            },
        }
        return response;

    }

    @Get(':id')
    async getDataByID(@Param() id: string) {
        var data = await this.BannerService.findOne2(id);

        return data;
    }
}
