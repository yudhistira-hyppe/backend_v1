import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Req, Request, Query, Headers, HttpCode } from '@nestjs/common';
import { UserbasicsService } from './userbasics.service';
import { CreateUserbasicDto } from './dto/create-userbasic.dto';
import { Userbasic } from './schemas/userbasic.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { isEmpty } from 'rxjs';

@Controller('api/userbasics')
export class UserbasicsController {
  constructor(private readonly userbasicsService: UserbasicsService) { }

  @Post()
  async create(@Body() CreateUserbasicDto: CreateUserbasicDto) {
    await this.userbasicsService.create(CreateUserbasicDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Userbasic[]> {
    return this.userbasicsService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<Userbasic> {
  //   return this.userbasicsService.findOne(id);
  // }
  @UseGuards(JwtAuthGuard)
  @Get(':email')
  async findOne(@Res() res, @Param('email') email: string): Promise<Userbasic> {


    const messagesEror = {
      "info": ["Todo is not found!"],
    };


    const messages = {
      "info": ["The process successful"],
    };

    try {
      let data = await this.userbasicsService.findOne(email);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }

  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userbasicsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractiveyear')
  async countUserActiveGroupByMonth(
    @Body('year') year: number,
  ): Promise<Object> {
    return this.userbasicsService.UserActiveLastYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractivebeforetoday')
  async countAllUserActiveDay(@Body('day') day: number): Promise<Object> {
    return this.userbasicsService.UserActiveDay(day);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('userage')
  async userage(): Promise<Object> {
    return this.userbasicsService.UserAge();
  }


  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Res() res, @Param('id') id: string, @Body() createUserbasicDto: CreateUserbasicDto) {

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      let data = await this.userbasicsService.update(id, createUserbasicDto);
      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('v2/interest?')
  async getinterest(@Request() req, @Headers('x-auth-token') auth: string, @Res() res, @Query('langIso') langIso: string, @Query('pageNumber') pageNumber: number, @Query('pageRow') pageRow: number, @Query('search') search: string): Promise<Userbasic> {
    //console.log(auth);
    var reqdata = req.user;
    var email = reqdata.email;
    const messagesEror = {
      "info": ["Todo is not found!"],
    };


    const messages = {
      "info": ["Interests retrieved"],
    };

    var pgnumber = parseInt(pageNumber.toString());
    var pgrow = parseInt(pageRow.toString());
    try {
      let data = await this.userbasicsService.getinterest(email, langIso, pgnumber, pgrow, search);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "total": pgrow.toString(),
        "data": data,
        "message": messages,
        "page": pgnumber.toString()
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": e.toString()
      });
    }

  }

  //@UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('kyc/list')
  async getkyc(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('search') search: string,
    @Query('skip') skip: number,
    @Query('limit') limit: number,
    @Headers('x-auth-token') auth: string) {
    var startDate_ = null;
    var endDate_ = null;
    var search_ = "";
    var skip_ = null;
    var limit_ = null;
    if (startDate != undefined && startDate != "") {
      startDate_ = startDate;
    }
    if (endDate != undefined && endDate != "") {
      endDate_ = endDate;
    }
    if (search != undefined && search != "") {
      search_ = search;
    }
    if (skip != undefined) {
      skip_ = skip;
    }
    if (limit != undefined) {
      limit_ = limit;
    }
    var data = await this.userbasicsService.kycList(startDate_, endDate_, search_, skip_, limit_);
    var totalRow = (await this.userbasicsService.kycList(startDate_, endDate_, search_, null, null)).length;
    return {
      response_code: 202, data: data, totalRow: totalRow, skip: skip, limit: limit, messages: {}
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('newuser')
  async countPostsesiactiv(@Req() request): Promise<Object> {
    var datasesi = [];

    var startdate = null;
    var enddate = null;
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];

    var date1 = new Date(startdate);
    var date2 = new Date(enddate);

    //calculate time difference  
    var time_difference = date2.getTime() - date1.getTime();

    //calculate days difference by dividing total milliseconds in a day  
    var resultTime = time_difference / (1000 * 60 * 60 * 24);
    console.log(resultTime);
    try {
      datasesi = await this.userbasicsService.userNew(startdate, enddate);
    } catch (e) {
      datasesi = [];
    }

    var data = [];
    if (resultTime > 0) {
      for (var i = 0; i < resultTime + 1; i++) {
        var dt = new Date(startdate);
        dt.setDate(dt.getDate() + i);
        var splitdt = dt.toISOString();
        var dts = splitdt.split('T');
        var stdt = dts[0].toString();
        var count = 0;
        for (var j = 0; j < datasesi.length; j++) {
          if (datasesi[j].date == stdt) {
            count = datasesi[j].count;
            break;
          }
        }
        data.push({
          'date': stdt,
          'count': count
        });

      }

    }

    return { response_code: 202, data, messages };
  }

  @UseGuards(JwtAuthGuard)
  @Post('demografis')
  async countPostareas(@Req() request): Promise<any> {
    var data = [];

    var startdate = null;
    var enddate = null;
    var wilayah = [];
    var dataSumwilayah = [];
    var lengwilayah = 0;
    var sumwilayah = 0;
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];

    try {
      data = await this.userbasicsService.demografis(startdate, enddate);
      wilayah = data[0].wilayah;
      lengwilayah = wilayah.length;
    } catch (e) {
      data = [];
      wilayah = [];
      lengwilayah = 0;
    }


    if (lengwilayah > 0) {

      for (let i = 0; i < lengwilayah; i++) {
        sumwilayah += wilayah[i].count;

      }

    } else {
      sumwilayah = 0;
    }

    if (lengwilayah > 0) {

      for (let i = 0; i < lengwilayah; i++) {
        let count = wilayah[i].count;
        let state = null;
        let stateName = wilayah[i].stateName;

        if (stateName == null) {
          state = "Other";
        } else {
          state = stateName;
        }

        let persen = count * 100 / sumwilayah;
        let objcounwilayah = {
          stateName: state,
          count: count,
          persen: persen.toFixed(2)
        }
        dataSumwilayah.push(objcounwilayah);
      }

    } else {
      dataSumwilayah = [];
    }

    data[0].wilayah = dataSumwilayah;

    return { response_code: 202, data, messages };
  }
}