import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Logger, UploadedFile, UseInterceptors, BadRequestException, Header, NotAcceptableException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { MonetizationService } from './monetization.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from '../logapis/logapis.service';
import { Monetize } from './schemas/monetization.schema';
import { TemplatesRepoService } from 'src/infra/templates_repo/templates_repo.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';

@Controller('api/monetization')
export class MonetizationController {
  constructor(
    private readonly monetizationService: MonetizationService,
    private readonly utilService: UtilsService,
    private readonly LogAPISS: LogapisService,
    private readonly repoSS: TemplatesRepoService,
    private readonly basic2SS: UserbasicnewService,
  ) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.monetizationService.findOne(id);
  }

  @Get('/summary/:id')
  async detailfindOne(@Param('id') id: string) {
    return this.monetizationService.detailOne(id);
  }

  @Get()
  async index() {
    return this.monetizationService.find();
  }

  @Post("/create")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('coinThumb'))
  async create(@UploadedFile() file: Express.Multer.File, @Headers() headers, @Body() body) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/create";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    let type = body.type;
    let toLog = body;
    delete toLog['coinThumb'];
    let data;

    if (type == 'COIN') {
      data = this.monetizationService.createCoin(file, body);
    }
    else if (type == 'CREDIT') {
      data = this.monetizationService.createCredit(headers, body);
    }

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, toLog);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/list")
  async listAllCoins(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilService.getDateTimeString();
    var url = headers.host + "/api/monetization/list";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json.page == undefined || request_json.page == null) { throw new BadRequestException("Missing field page (number)"); }
    if (request_json.limit == undefined || request_json.limit == null) { throw new BadRequestException("Missing field: limit (number)"); }
    if (request_json.descending == undefined || request_json.descending == null) { throw new BadRequestException("Missing field: descending (boolean)"); }
    if (request_json.type == undefined || !request_json.type) { throw new BadRequestException("Missing field: type (string 'COIN'/'CREDIT')"); }
    if (request_json.type !== "COIN" && request_json.type !== "CREDIT") { throw new BadRequestException("type must be 'COIN' or 'CREDIT'"); }
    let skip = (request_json.page >= 0 ? request_json.page : 0) * request_json.limit;
    var data = await this.monetizationService.listAllCoin(skip, request_json.limit, request_json.descending, request_json.type, request_json.name, request_json.from, request_json.to, request_json.stock_gte, request_json.stock_lte, request_json.status, request_json.audiens, request_json.item_id);

    var timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/deactivate")
  @UseGuards(JwtAuthGuard)
  async deactivate(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/deactivate";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(request.body));

    let data = this.monetizationService.deactivate(request_json.id);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/activate")
  @UseGuards(JwtAuthGuard)
  async activate(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/activate";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(request.body));
    let data = this.monetizationService.activate(request_json.id);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post('status/:id')
  @UseGuards(JwtAuthGuard)
  async changeStatus(@Param() id: string, @Req() req, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = req.get('Host') + req.originalUrl;
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(req.body));

    var data = await this.monetizationService.findOne(id);
    if (data != null) {
      var setupdatedata = new Monetize();
      setupdatedata.status = request_json.status;

      await this.monetizationService.updateOne(id, setupdatedata);

      let timestamps_end = await this.utilService.getDateTimeString();
      this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

      if (data.type == "CREDIT") {
        if (data.audiens == "EXCLUSIVE" && data.isSend == false) {
          this.sendNotifAudiens(data);
        }
      }

      return {
        response_code: 202,
        message: {
          "info": ["The process was successful"],
        }
      }
    }
    else {
      throw new NotAcceptableException("Data not found");
    }
  }

  @Post("/delete")
  @UseGuards(JwtAuthGuard)
  async delete(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/delete";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(request.body));

    let data = this.monetizationService.delete(request_json.id);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  async sendNotifAudiens(data: any) {

    var templatedata = await this.repoSS.findOne("65e932f8c87900009e001bc2");
    let userdata = data.audiens_user;
    var setpagination = parseInt(userdata.length) / 2;
    var ceksisa = (parseInt(userdata.length) % 2);
    if (ceksisa > 0 && ceksisa < 5) {
      setpagination = setpagination + 1;
    }

    for (var looppagination = 0; looppagination < setpagination; looppagination++) {
      var getalluserbasic = await this.basic2SS.findInbyid(userdata.slice((looppagination * 2), ((looppagination + 1) * 2)));

      for (var loopuser = 0; loopuser < getalluserbasic.length; loopuser++) {
        var titleEN = templatedata.subject.replace("$paket", data.name);
        var titleID = templatedata.subject_id.replace("$paket", data.name);
        var bodyEN = templatedata.body_detail.replace("$paket", data.name);
        var bodyID = templatedata.body_detail_id.replace("$paket", data.name);
        await this.utilService.sendFcmPushNotif(getalluserbasic[loopuser].email, titleID, bodyID, titleEN, bodyEN, templatedata.category.toString(), templatedata.type.toString(), "", data.redirectUrl);
      }
    }

    var updatedata = new Monetize();
    updatedata.isSend = true;
    updatedata.updatedAt = await this.utilService.getDateTimeString();
    await this.monetizationService.updateOne(data._id.toString(), updatedata);
  }
}
