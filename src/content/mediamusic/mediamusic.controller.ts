import { Body, Controller, Get, Post, UseGuards, Headers, HttpCode, Query, HttpStatus, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { MediamusicService } from './mediamusic.service';
import { MediamusicDto } from './dto/mediamusic.dto';
import { Mediamusic } from './schemas/mediamusic.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import mongoose from 'mongoose';

@Controller()
export class MediamusicController {
  constructor(
    private readonly mediamusicService: MediamusicService,
    private readonly utilsService: UtilsService,
    private readonly userbasicsService: UserbasicsService,
    private readonly errorHandler: ErrorHandler) { }

  @UseGuards(JwtAuthGuard)
  @Post('api/music/create')
  @HttpCode(HttpStatus.ACCEPTED)
  async createMusicPost(@Body() MediamusicDto_: MediamusicDto, @Headers() headers) {
    if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email header dan token not match',
      );
    }
    var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
    if (!(await this.utilsService.ceckData(profile))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
    if (MediamusicDto_.musicTitle == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param musicTitle is required',
      );
    }
    if (MediamusicDto_.artistName == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param artistName is required',
      );
    }
    if (MediamusicDto_.genre == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param genre is required',
      );
    }
    if (MediamusicDto_.theme == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param theme is required',
      );
    }
    if (MediamusicDto_.mood == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param mood is required',
      );
    }
    if (MediamusicDto_.apsaraMusic == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param apsaraMusic is required',
      );
    }

    //const currentDate = await this.utilsService.getDateTimeString();
    const currentDate = new Date();
    var _MediamusicDto_ = new MediamusicDto();
    _MediamusicDto_._id = new mongoose.Types.ObjectId();
    _MediamusicDto_.musicTitle = MediamusicDto_.musicTitle;
    _MediamusicDto_.artistName = MediamusicDto_.artistName;
    _MediamusicDto_.albumName = MediamusicDto_.albumName;
    _MediamusicDto_.releaseDate = MediamusicDto_.releaseDate;
    _MediamusicDto_.isActive = true;
    _MediamusicDto_.isDelete = false;
    _MediamusicDto_.createdAt = currentDate;
    _MediamusicDto_.updatedAt = currentDate;
    _MediamusicDto_.genre = new mongoose.Types.ObjectId(MediamusicDto_.genre);
    _MediamusicDto_.theme = new mongoose.Types.ObjectId(MediamusicDto_.theme);
    _MediamusicDto_.mood = new mongoose.Types.ObjectId(MediamusicDto_.mood);
    _MediamusicDto_.apsaraMusic = MediamusicDto_.apsaraMusic;
    _MediamusicDto_.apsaraThumnail = MediamusicDto_.apsaraThumnail;

    var data = await this.mediamusicService.createMusic(_MediamusicDto_);
    var Response = {
      response_code: 202,
      data: data,
      messages: {
        info: [
          "Create music succesfully"
        ]
      }
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/music/update')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateMusicPost(@Body() MediamusicDto_: MediamusicDto, @Headers() headers) {
    if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email header dan token not match',
      );
    }
    var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
    if (!(await this.utilsService.ceckData(profile))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
    if (MediamusicDto_._id == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param _id is required',
      );
    }
    if (MediamusicDto_.musicTitle == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param musicTitle is required',
      );
    }
    if (MediamusicDto_.artistName == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param artistName is required',
      );
    }
    if (MediamusicDto_.genre == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param genre is required',
      );
    }
    if (MediamusicDto_.theme == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param theme is required',
      );
    }
    if (MediamusicDto_.mood == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param mood is required',
      );
    }
    if (MediamusicDto_.apsaraMusic == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param apsaraMusic is required',
      );
    }

    //const currentDate = await this.utilsService.getDateTimeString();
    const currentDate = new Date();
    var _MediamusicDto_ = new MediamusicDto();
    _MediamusicDto_.musicTitle = MediamusicDto_.musicTitle;
    _MediamusicDto_.artistName = MediamusicDto_.artistName;
    _MediamusicDto_.albumName = MediamusicDto_.albumName;
    _MediamusicDto_.releaseDate = MediamusicDto_.releaseDate;
    _MediamusicDto_.isActive = true;
    _MediamusicDto_.isDelete = false;
    _MediamusicDto_.updatedAt = currentDate;
    _MediamusicDto_.genre = new mongoose.Types.ObjectId(MediamusicDto_.genre);
    _MediamusicDto_.theme = new mongoose.Types.ObjectId(MediamusicDto_.theme);
    _MediamusicDto_.mood = new mongoose.Types.ObjectId(MediamusicDto_.mood);
    _MediamusicDto_.apsaraMusic = MediamusicDto_.apsaraMusic;
    _MediamusicDto_.apsaraThumnail = MediamusicDto_.apsaraThumnail;
    await this.mediamusicService.updateMusic(MediamusicDto_._id.toString(), _MediamusicDto_);
    var Response = {
      response_code: 202,
      data: _MediamusicDto_,
      messages: {
        info: [
          "Update music succesfully"
        ]
      }
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/music/:id')
  async getOneMusicPost(@Param('id') id: string, @Headers() headers) {
    if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email header dan token not match',
      );
    }
    if (id == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param id is required',
      );
    }
    var data = await this.mediamusicService.findOneDetail(id);
    console.log("data",data);
    var Response = {
      data: data,
      response_code: 202,
      messages: {
        info: [
          "Get music succesfully"
        ]
      }
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/music/')
  @HttpCode(HttpStatus.ACCEPTED)
  async getMusicPost(
    @Query('pageNumber') pageNumber: number,
    @Query('pageRow') pageRow: number,
    @Query('genre') genre: string,
    @Query('theme') theme: string,
    @Query('mood') mood: string,
    @Query('search') search: string, @Headers() headers) {
    if (headers['x-auth-user'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email header dan token not match',
      );
    }
    const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
    const pageRow_ = (pageRow != undefined) ? pageRow : 8;
    const search_ = search;
    const genre_ = genre;
    const theme_ = theme;
    const mood_ = mood;
    const data = await this.mediamusicService.findCriteria(pageNumber_, pageRow_, search_, genre_, theme_, mood_);
    var data_ = await Promise.all(data.map(async item => {
      console.log(item.apsaraMusic);
      var dataApsaraMusic = await this.mediamusicService.getVideoApsaraSingle(item.apsaraMusic)
      console.log(dataApsaraMusic);
      var apsaraMusicData = {}
      if (dataApsaraMusic != null && dataApsaraMusic.PlayInfoList != null && dataApsaraMusic.PlayInfoList.PlayInfo && dataApsaraMusic.PlayInfoList.PlayInfo.length > 0) {
        apsaraMusicData = {
          PlayURL: dataApsaraMusic.PlayInfoList.PlayInfo[0].PlayURL,
          Duration: dataApsaraMusic.PlayInfoList.PlayInfo[0].Duration,
        }
      }
      var dataApsaraThumnail = await this.mediamusicService.getImageApsara([item.apsaraThumnail])
      //console.log(dataApsaraThumnail);
      var apsaraThumnailUrl = null
      if (dataApsaraThumnail != undefined && dataApsaraThumnail.ImageInfo != undefined && dataApsaraThumnail.ImageInfo.length > 0) {
        apsaraThumnailUrl = dataApsaraThumnail.ImageInfo[0].URL
      }
      return {
        _id: item._id,
        musicTitle: item.musicTitle,
        artistName: item.artistName,
        albumName: item.albumName,
        releaseDate: item.releaseDate,
        genre: item.genre,
        theme: item.theme,
        mood: item.mood,
        isDelete: item.isDelete,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        used: item.used,
        apsaraMusic: item.apsaraMusic,
        apsaraMusicUrl: apsaraMusicData,
        apsaraThumnail: item.apsaraThumnail,
        apsaraThumnailUrl: apsaraThumnailUrl,
      };
    }));
    var Response = {
      response_code: 202,
      total: data.length.toString(),
      data: data_,
      messages: {
        info: [
          "Music retrieved succesfully"
        ]
      },
      page: pageNumber
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/music/delete')
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteMusicPost(@Headers() headers, @Body() body) {
    if (headers['x-auth-user'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email header dan token not match',
      );
    }
    if (body ._id==undefined) {
      await this.errorHandler.generateBadRequestException(
        'Unabled to proceed param _id is required',
      );
    }
    await this.mediamusicService.deleteMusic(body._id);
    var Response = {
      response_code: 202,
      messages: {
        info: [
          "Delete music succesfully"
        ]
      }
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/musiccard/')
  @HttpCode(HttpStatus.ACCEPTED)
  async getMusicCard(@Headers() headers) {
    const data = await this.mediamusicService.getMusicCard();
    var Response = {
      response_code: 202,
      data: data,
      messages: {
        info: [
          "Retrieved music card succesfully"
        ]
      }
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/allmusic/')
  @HttpCode(HttpStatus.ACCEPTED)
  async getMusicFilter(
    @Query('pageNumber') pageNumber: number,
    @Query('pageRow') pageRow: number,
    @Query('genre') genre: string,
    @Query('theme') theme: string,
    @Query('mood') mood: string,
    @Query('musicTitle') musicTitle: string,
    @Query('artistName') artistName: string,
    @Query('createdAtStart') createdAtStart: string,
    @Query('createdAtEnd') createdAtEnd: string,
    @Query('status') status: string,
    @Headers() headers) {
    if (headers['x-auth-user'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email header dan token not match',
      );
    }

    const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
    const pageRow_ = (pageRow != undefined) ? pageRow : 10;
    const genre_ = genre;
    const theme_ = theme;
    const mood_ = mood;
    const musicTitle_ = musicTitle;
    const artistName_ = artistName;
    const createdAtStart_ = createdAtStart;
    const createdAtEnd_ = createdAtEnd;
    const status_ = status;

    const data = await this.mediamusicService.getMusicFilter(pageNumber_, pageRow_, genre_, theme_, mood_, musicTitle_, artistName_, createdAtStart_, createdAtEnd_, status_);
    var Response = {
      response_code: 202,
      data: data,
      messages: {
        info: [
          "Retrieved music card succesfully"
        ]
      }
    }
    return Response;
  }
}
