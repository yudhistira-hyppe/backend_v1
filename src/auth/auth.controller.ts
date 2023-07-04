import {
  Controller,
  Request,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Put,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  Res,
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  NotAcceptableException,
  UploadedFiles,
  HttpException,
} from '@nestjs/common';
import * as fs from 'fs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { UtilsService } from '../utils/utils.service';
import { SettingsService } from '../trans/settings/settings.service';
import { JwtRefreshAuthGuard } from './refresh-auth.guard';
import { DeviceActivityRequest, LoginRequest, LogoutRequest, RefreshTokenRequest } from '../utils/data/request/globalRequest';
import { CreateActivityeventsDto } from '../trans/activityevents/dto/create-activityevents.dto';
import { CreateUserdeviceDto } from '../trans/userdevices/dto/create-userdevice.dto';
import { ActivityeventsService } from '../trans/activityevents/activityevents.service';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserdevicesService } from '../trans/userdevices/userdevices.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';
import { LanguagesService } from '../infra/languages/languages.service';
import { ErrorHandler } from '../utils/error.handler';
import { MediaprofilepictsService } from '../content/mediaprofilepicts/mediaprofilepicts.service';
import { MediaproofpictsService } from '../content/mediaproofpicts/mediaproofpicts.service';
import { UserticketsService } from '../trans/usertickets/usertickets.service';
import { UserticketdetailsService } from '../trans/usertickets/userticketdetails/userticketdetails.service';
import mongoose, { Types } from 'mongoose';
import { Int32 } from 'mongodb';
import { ProfileDTO } from '../utils/data/Profile';
import { GlobalResponse } from '../utils/data/globalResponse';
import { GlobalMessages } from '../utils/data/globalMessage';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express/multer';
import { FormDataRequest } from 'nestjs-form-data';
import { CreateUserbasicDto, SearchUserbasicDto } from '../trans/userbasics/dto/create-userbasic.dto';
import { PostsService } from '../content/posts/posts.service';
import { ContenteventsService } from '../content/contentevents/contentevents.service';
import { InsightsService } from '../content/insights/insights.service';
import { Long } from 'mongodb';
import { OtpService } from './otp.service';
import { SocmedService } from './socmed.service';
import { GroupService } from '../trans/usermanagement/group/group.service';
import { UserbankaccountsService } from '../trans/userbankaccounts/userbankaccounts.service';
import { OssService } from '../stream/oss/oss.service';
import { CreateMediaprofilepictsDto } from 'src/content/mediaprofilepicts/dto/create-mediaprofilepicts.dto';
import { FriendListService } from 'src/content/friend_list/friend_list.service';
import { CreateUserauthDto } from 'src/trans/userauths/dto/create-userauth.dto';

const sharp = require('sharp');
const convert = require('heic-convert');

@Controller()
export class AuthController {

  private readonly logger = new Logger(AuthController.name);
  constructor(
    private groupService: GroupService,
    private ossService: OssService,
    private errorHandler: ErrorHandler,
    private authService: AuthService,
    private utilsService: UtilsService,
    private activityeventsService: ActivityeventsService,
    private userbasicsService: UserbasicsService,
    private userdevicesService: UserdevicesService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private userauthsService: UserauthsService,
    private interestsRepoService: InterestsRepoService,
    private languagesService: LanguagesService,
    private postsService: PostsService,
    private settingsService: SettingsService,
    private contenteventsService: ContenteventsService,
    private insightsService: InsightsService,
    private socmed: SocmedService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private mediaproofpictsService: MediaproofpictsService,
    private userticketsService: UserticketsService,
    private userbankaccountsService: UserbankaccountsService,
    private userticketdetailsService: UserticketdetailsService,
    private friendListService: FriendListService,

  ) { }

  // @UseGuards(LocalAuthGuard)
  // @Post('api/user/login')
  // @HttpCode(HttpStatus.ACCEPTED)
  // async login(@Body() LoginRequest_: LoginRequest) {

  //   var current_date = await this.utilsService.getDateTimeString();

  //   var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
  //   var _class_UserDevices = 'io.melody.core.domain.UserDevices';

  //   var _isEmailVerified = false;

  //   //Ceck User ActivityEvent Parent
  //   const data_activityevents = await this.activityeventsService.findParent(
  //     LoginRequest_.email,
  //     LoginRequest_.deviceId,
  //     'LOGIN',
  //     false,
  //   );

  //   //Generate Refresh Token
  //   await this.authService.updateRefreshToken(LoginRequest_.email.toString());

  //   //Ceck User Userdevices
  //   const data_userdevices = await this.userdevicesService.findOneEmail(LoginRequest_.email, LoginRequest_.deviceId);

  //   //Ceck User Userauths
  //   const data_userauths = await this.userauthsService.findOneByEmail(
  //     LoginRequest_.email,
  //   );

  //   //Generate Refresh Token
  //   await this.authService.updateRefreshToken(LoginRequest_.email.toString());

  //   //Ceck User Userbasics
  //   const data_userbasics = await this.userbasicsService.findOne(
  //     LoginRequest_.email,
  //   );

  //   //Ceck User jwtrefresh token
  //   const data_jwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
  //     LoginRequest_.email,
  //   );

  //   var lang = "id";
  //   if (LoginRequest_.lang != undefined) {
  //     lang = LoginRequest_.lang.toString();
  //   }

  //   if ((await this.utilsService.ceckData(data_userbasics)) && (await this.utilsService.ceckData(data_jwtrefreshtoken))) {
  //     if (await this.utilsService.ceckData(data_userauths)) {
  //       _isEmailVerified = data_userauths.isEmailVerified;
  //     } else {
  //       if (lang == "en") {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'No users were found. Please check again.',
  //         );
  //       } else {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
  //         );
  //       }
  //     }

  //     if (_isEmailVerified) {
  //       let messages_response;
  //       if (Object.keys(data_activityevents).length > 0) {
  //         var Activityevents_child = new CreateActivityeventsDto();
  //         var generate_id_Activityevents_child = new mongoose.Types.ObjectId();
  //         var generate_activityEventID_Activityevents_child = (await this.utilsService.generateId()).toLowerCase();

  //         var latitude = undefined;
  //         var longitude = undefined;
  //         if (LoginRequest_.location != undefined) {
  //           if (LoginRequest_.location.latitude != undefined) {
  //             latitude = LoginRequest_.location.latitude;
  //           }
  //           if (LoginRequest_.location.longitude != undefined) {
  //             longitude = LoginRequest_.location.longitude;
  //           }
  //         }
  //         //Create ActivityEvent child
  //         try {
  //           Activityevents_child._id = generate_id_Activityevents_child;
  //           Activityevents_child.activityEventID =
  //             generate_activityEventID_Activityevents_child;
  //           Activityevents_child.activityType = 'DEVICE_ACTIVITY';
  //           Activityevents_child.active = true;
  //           Activityevents_child.status = 'INITIAL';
  //           Activityevents_child.target = 'ACTIVE';
  //           Activityevents_child.event = 'AWAKE';
  //           Activityevents_child._class = _class_ActivityEvent;
  //           Activityevents_child.payload = {
  //             login_location: {
  //               latitude: latitude,
  //               longitude: longitude,
  //             },
  //             logout_date: undefined,
  //             login_date: current_date,
  //             login_device: LoginRequest_.deviceId,
  //             email: LoginRequest_.email,
  //           };
  //           Activityevents_child.createdAt = current_date;
  //           Activityevents_child.updatedAt = current_date;
  //           Activityevents_child.sequenceNumber = new Int32(1);
  //           Activityevents_child.flowIsDone = false;
  //           Activityevents_child.__v = undefined;
  //           Activityevents_child.parentActivityEventID =
  //             data_activityevents[0].activityEventID;
  //           Activityevents_child.userbasic =
  //             data_userbasics._id;

  //           //Insert ActivityEvent child

  //           const event = await this.activityeventsService.create(Activityevents_child);
  //           let idevent = event._id;
  //           let eventType = event.event.toString();

  //           await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, data_userbasics._id);
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, Failed create Activity events Child. Error:' + error,
  //           );
  //         }

  //         //Update ActivityEvent Parent
  //         try {
  //           const data_transitions = data_activityevents[0].transitions;
  //           data_transitions.push({
  //             $ref: 'activityevents',
  //             $id: new Object(generate_activityEventID_Activityevents_child),
  //             $db: 'hyppe_trans_db',
  //           });

  //           //Update ActivityEvent Parent
  //           const update_activityevents_parent =
  //             await this.activityeventsService.update(
  //               {
  //                 _id: data_activityevents[0]._id,
  //               },
  //               {
  //                 transitions: data_transitions,
  //               },
  //             );
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed Update Activity events Parent. Error:' +
  //             error,
  //           );
  //         }
  //         messages_response = 'Device activity logging successful';
  //       } else {
  //         var Activityevents_parent = new CreateActivityeventsDto();
  //         var generate_id_Activityevents_parent = new mongoose.Types.ObjectId();
  //         var generate_activityEventID_Activityevents_parent = (await this.utilsService.generateId()).toLowerCase();

  //         var Activityevents_child = new CreateActivityeventsDto();
  //         var generate_id_Activityevents_child = new mongoose.Types.ObjectId();
  //         var generate_activityEventID_Activityevents_child = (await this.utilsService.generateId()).toLowerCase();

  //         var latitude = undefined;
  //         var longitude = undefined;
  //         if (LoginRequest_.location != undefined) {
  //           if (LoginRequest_.location.latitude != undefined) {
  //             latitude = LoginRequest_.location.latitude;
  //           }
  //           if (LoginRequest_.location.longitude != undefined) {
  //             longitude = LoginRequest_.location.longitude;
  //           }
  //         }

  //         //Create ActivityEvent Parent
  //         try {
  //           Activityevents_parent._id = generate_id_Activityevents_parent;
  //           Activityevents_parent.activityEventID = generate_activityEventID_Activityevents_parent;
  //           Activityevents_parent.activityType = 'LOGIN';
  //           Activityevents_parent.active = true;
  //           Activityevents_parent.status = 'INITIAL';
  //           Activityevents_parent.target = 'USER_LOGOUT';
  //           Activityevents_parent.event = 'LOGIN';
  //           Activityevents_parent._class = _class_ActivityEvent;
  //           Activityevents_parent.payload = {
  //             login_location: {
  //               latitude: latitude,
  //               longitude: longitude,
  //             },
  //             logout_date: undefined,
  //             login_date: current_date,
  //             login_device: LoginRequest_.deviceId,
  //             email: LoginRequest_.email,
  //           };
  //           Activityevents_parent.createdAt = current_date;
  //           Activityevents_parent.updatedAt = current_date;
  //           Activityevents_parent.sequenceNumber = new Int32(0);
  //           Activityevents_parent.flowIsDone = false;
  //           Activityevents_parent.__v = undefined;
  //           Activityevents_parent.transitions = [
  //             {
  //               $ref: 'activityevents',
  //               $id: Object(generate_activityEventID_Activityevents_child),
  //               $db: 'hyppe_trans_db',
  //             },
  //           ];
  //           Activityevents_parent.userbasic = data_userbasics._id;

  //           //Insert ActivityEvent Parent
  //           const event = await this.activityeventsService.create(Activityevents_parent);
  //           let idevent = event._id;
  //           let eventType = event.event.toString();

  //           await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, data_userbasics._id);
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, Failed create activity events parent. Error:' +
  //             error,
  //           );
  //         }

  //         //Create ActivityEvent child
  //         try {
  //           Activityevents_child._id = generate_id_Activityevents_child;
  //           Activityevents_child.activityEventID = generate_activityEventID_Activityevents_child;
  //           Activityevents_child.activityType = 'DEVICE_ACTIVITY';
  //           Activityevents_child.active = true;
  //           Activityevents_child.status = 'INITIAL';
  //           Activityevents_child.target = 'ACTIVE';
  //           Activityevents_child.event = 'AWAKE';
  //           Activityevents_child._class = _class_ActivityEvent;
  //           Activityevents_child.payload = {
  //             login_location: {
  //               latitude: latitude,
  //               longitude: longitude,
  //             },
  //             logout_date: undefined,
  //             login_date: current_date,
  //             login_device: LoginRequest_.deviceId,
  //             email: LoginRequest_.email,
  //           };
  //           Activityevents_child.createdAt = current_date;
  //           Activityevents_child.updatedAt = current_date;
  //           Activityevents_child.sequenceNumber = new Int32(1);
  //           Activityevents_child.flowIsDone = false;
  //           Activityevents_child.__v = undefined;
  //           Activityevents_child.parentActivityEventID = generate_activityEventID_Activityevents_parent;
  //           Activityevents_child.userbasic = data_userbasics._id;

  //           //Insert ActivityEvent Parent


  //           const event = await this.activityeventsService.create(Activityevents_child);
  //           let idevent = event._id;
  //           let eventType = event.event.toString();

  //           await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, data_userbasics._id);
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, Failed create Activity events Child. Error:' + error,
  //           );
  //         }

  //         var Id_user_userdevices = null;
  //         //Userdevices != null
  //         if (await this.utilsService.ceckData(data_userdevices)) {
  //           //Get Userdevices
  //           try {
  //             var data_update = null;
  //             if (LoginRequest_.devicetype != undefined) {
  //               data_update = {
  //                 active: true,
  //                 devicetype: LoginRequest_.devicetype
  //               };
  //             } else {
  //               data_update = {
  //                 active: true
  //               };
  //             }
  //             await this.userdevicesService.updatebyEmail(LoginRequest_.email, LoginRequest_.deviceId, data_update);
  //             Id_user_userdevices = data_userdevices._id;
  //           } catch (error) {
  //             await this.errorHandler.generateNotAcceptableException(
  //               'Unabled to proceed, Failed update user devices. Error:' + error,
  //             );
  //           }
  //         } else {
  //           var CreateUserdeviceDto_ = new CreateUserdeviceDto();
  //           //Create Userdevices
  //           try {
  //             Id_user_userdevices = (await this.utilsService.generateId()).toLowerCase();
  //             CreateUserdeviceDto_._id = Id_user_userdevices;
  //             CreateUserdeviceDto_.deviceID = LoginRequest_.deviceId;
  //             CreateUserdeviceDto_.email = LoginRequest_.email;
  //             CreateUserdeviceDto_.active = true;
  //             CreateUserdeviceDto_._class = _class_UserDevices;
  //             CreateUserdeviceDto_.createdAt = current_date;
  //             CreateUserdeviceDto_.updatedAt = current_date;
  //             if (LoginRequest_.devicetype != undefined) {
  //               CreateUserdeviceDto_.devicetype = LoginRequest_.devicetype;
  //             }
  //             //Insert User Userdevices
  //             await this.userdevicesService.create(CreateUserdeviceDto_);
  //           } catch (error) {
  //             await this.errorHandler.generateNotAcceptableException(
  //               'Unabled to proceed, Failed update user devices. Error:' + error,
  //             );
  //           }
  //         }


  //         //Update Devices Userauths
  //         try {
  //           //Get Devices Userauths
  //           const data_userauths_devices_list = data_userauths.devices;

  //           //Filter ID_user_userdevicesService Devices UserDevices
  //           var filteredData = data_userauths_devices_list.filter(function (data_userauths_devices_list) {
  //             return (JSON.parse(JSON.stringify(data_userauths_devices_list)).$id === Id_user_userdevices);
  //           });

  //           if (filteredData.length == 0) {
  //             //Pust Devices Userauths
  //             data_userauths_devices_list.push({
  //               $ref: 'userdevices',
  //               $id: Object(Id_user_userdevices),
  //               $db: 'hyppe_trans_db',
  //             });

  //             await this.userauthsService.updatebyEmail(LoginRequest_.email, {
  //               devices: data_userauths_devices_list,
  //             });
  //           }
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, Failed update devices userauths. Error:' + error,
  //           );
  //         }
  //         messages_response = 'Login successful';
  //       }

  //       var datasetting = await this.settingsService.findAll();

  //       var ProfileDTO_ = new ProfileDTO();
  //       ProfileDTO_ = await this.utilsService.generateProfile(LoginRequest_.email, 'LOGIN');
  //       ProfileDTO_.token = 'Bearer ' + (await this.utilsService.generateToken(LoginRequest_.email, LoginRequest_.deviceId)).toString();
  //       ProfileDTO_.refreshToken = data_jwtrefreshtoken.refresh_token_id;
  //       ProfileDTO_.listSetting = datasetting;

  //       var GlobalResponse_ = new GlobalResponse();
  //       var GlobalMessages_ = new GlobalMessages();
  //       GlobalMessages_.info = [messages_response];

  //       GlobalResponse_.response_code = 202;
  //       GlobalResponse_.data = ProfileDTO_;
  //       GlobalResponse_.messages = GlobalMessages_;
  //       GlobalResponse_.version = await this.utilsService.getversion();
  //       return GlobalResponse_;
  //     } else {
  //       var messages = "Tidak dapat melanjutkan, Email pengguna belum diverifikasi";
  //       if (lang == "en") {
  //         messages = 'Unable to continue, User`s email has not been verified';
  //       } else {
  //         messages = "Tidak dapat melanjutkan, Email pengguna belum diverifikasi";
  //       }
  //       var response = {
  //         response_code: 202,
  //         data: {
  //           email: LoginRequest_.email,
  //           isEmailVerified: _isEmailVerified
  //         },
  //         messages: {
  //           info: [messages],
  //         },
  //       }
  //       return response;
  //       // if (lang == "en") {
  //       //   await this.errorHandler.generateNotAcceptableException(
  //       //     'Unable to continue, User`s email has not been verified',
  //       //   );
  //       // } else {
  //       //   await this.errorHandler.generateNotAcceptableException(
  //       //     'Tidak dapat melanjutkan, Email pengguna belum diverifikasi',
  //       //   );
  //       // }
  //     }
  //   } else {
  //     if (await this.utilsService.ceckData(data_userauths)) {
  //       _isEmailVerified = data_userauths.isEmailVerified;
  //       var messages = "Tidak dapat melanjutkan, Email pengguna belum diverifikasi";
  //       if (lang == "en") {
  //         messages = 'Unable to continue, User`s email has not been verified';
  //       } else {
  //         messages = "Tidak dapat melanjutkan, Email pengguna belum diverifikasi";
  //       }
  //       var response = {
  //         response_code: 202,
  //         data: {
  //           email: LoginRequest_.email,
  //           isEmailVerified: _isEmailVerified
  //         },
  //         messages: {
  //           info: [messages],
  //         },
  //       }
  //       return response;
  //     } else {
  //       if (lang == "en") {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'No users were found. Please check again.',
  //         );
  //       } else {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
  //         );
  //       }
  //     }
  //   }
  // }

  @UseGuards(LocalAuthGuard)
  @Post('api/user/login')
  @HttpCode(HttpStatus.ACCEPTED)
  async login(@Body() LoginRequest_: LoginRequest) {

    var getdevicedata = null;
    var current_date = await this.utilsService.getDateTimeString();

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';

    var _isEmailVerified = false;

    //Ceck User ActivityEvent Parent
    const data_activityevents = await this.activityeventsService.findParent(
      LoginRequest_.email,
      LoginRequest_.deviceId,
      'LOGIN',
      false,
    );

    //Generate Refresh Token
    await this.authService.updateRefreshToken(LoginRequest_.email.toString());

    //Ceck User Userdevices
    const data_userdevices = await this.userdevicesService.findOneEmail(LoginRequest_.email, LoginRequest_.deviceId);
    if (data_userdevices != null && data_userdevices != undefined) {
      if (data_userdevices.devicetype != undefined && data_userdevices.devicetype != null) {
        getdevicedata = data_userdevices.devicetype;
      }
    }

    //Ceck User Userauths
    const data_userauths = await this.userauthsService.findOneByEmail(
      LoginRequest_.email,
    );

    //Generate Refresh Token
    await this.authService.updateRefreshToken(LoginRequest_.email.toString());

    //Ceck User Userbasics
    const data_userbasics = await this.userbasicsService.findOne(
      LoginRequest_.email,
    );

    //Ceck User jwtrefresh token
    const data_jwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
      LoginRequest_.email,
    );

    var lang = "id";
    if (LoginRequest_.lang != undefined) {
      lang = LoginRequest_.lang.toString();
    }

    if ((await this.utilsService.ceckData(data_userbasics)) && (await this.utilsService.ceckData(data_jwtrefreshtoken))) {
      if (await this.utilsService.ceckData(data_userauths)) {
        _isEmailVerified = data_userauths.isEmailVerified;
      } else {
        if (lang == "en") {
          await this.errorHandler.generateNotAcceptableException(
            'No users were found. Please check again.',
          );
        } else {
          await this.errorHandler.generateNotAcceptableException(
            'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
          );
        }
      }

      if (_isEmailVerified) {
        let messages_response;
        if (Object.keys(data_activityevents).length > 0) {
          var Activityevents_child = new CreateActivityeventsDto();
          var generate_id_Activityevents_child = new mongoose.Types.ObjectId();
          var generate_activityEventID_Activityevents_child = (await this.utilsService.generateId()).toLowerCase();

          var latitude = undefined;
          var longitude = undefined;
          if (LoginRequest_.location != undefined) {
            if (LoginRequest_.location.latitude != undefined) {
              latitude = LoginRequest_.location.latitude;
            }
            if (LoginRequest_.location.longitude != undefined) {
              longitude = LoginRequest_.location.longitude;
            }
          }
          //Create ActivityEvent child
          try {
            Activityevents_child._id = generate_id_Activityevents_child;
            Activityevents_child.activityEventID =
              generate_activityEventID_Activityevents_child;
            Activityevents_child.activityType = 'DEVICE_ACTIVITY';
            Activityevents_child.active = true;
            Activityevents_child.status = 'INITIAL';
            Activityevents_child.target = 'ACTIVE';
            Activityevents_child.event = 'AWAKE';
            Activityevents_child._class = _class_ActivityEvent;
            Activityevents_child.payload = {
              login_location: {
                latitude: latitude,
                longitude: longitude,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: LoginRequest_.deviceId,
              email: LoginRequest_.email,
            };
            Activityevents_child.createdAt = current_date;
            Activityevents_child.updatedAt = current_date;
            Activityevents_child.sequenceNumber = new Int32(1);
            Activityevents_child.flowIsDone = false;
            Activityevents_child.__v = undefined;
            Activityevents_child.parentActivityEventID =
              data_activityevents[0].activityEventID;
            Activityevents_child.userbasic =
              data_userbasics._id;

            //Insert ActivityEvent child

            const event = await this.activityeventsService.create(Activityevents_child);
            let idevent = event._id;
            let eventType = event.event.toString();

            await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, data_userbasics._id);
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, Failed create Activity events Child. Error:' + error,
            );
          }

          //Update ActivityEvent Parent
          try {
            const data_transitions = data_activityevents[0].transitions;
            data_transitions.push({
              $ref: 'activityevents',
              $id: new Object(generate_activityEventID_Activityevents_child),
              $db: 'hyppe_trans_db',
            });

            //Update ActivityEvent Parent
            const update_activityevents_parent =
              await this.activityeventsService.update(
                {
                  _id: data_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update Activity events Parent. Error:' +
              error,
            );
          }
          messages_response = 'Device activity logging successful';
        } else {
          var Activityevents_parent = new CreateActivityeventsDto();
          var generate_id_Activityevents_parent = new mongoose.Types.ObjectId();
          var generate_activityEventID_Activityevents_parent = (await this.utilsService.generateId()).toLowerCase();

          var Activityevents_child = new CreateActivityeventsDto();
          var generate_id_Activityevents_child = new mongoose.Types.ObjectId();
          var generate_activityEventID_Activityevents_child = (await this.utilsService.generateId()).toLowerCase();

          var latitude = undefined;
          var longitude = undefined;
          if (LoginRequest_.location != undefined) {
            if (LoginRequest_.location.latitude != undefined) {
              latitude = LoginRequest_.location.latitude;
            }
            if (LoginRequest_.location.longitude != undefined) {
              longitude = LoginRequest_.location.longitude;
            }
          }

          //Create ActivityEvent Parent
          try {
            Activityevents_parent._id = generate_id_Activityevents_parent;
            Activityevents_parent.activityEventID = generate_activityEventID_Activityevents_parent;
            Activityevents_parent.activityType = 'LOGIN';
            Activityevents_parent.active = true;
            Activityevents_parent.status = 'INITIAL';
            Activityevents_parent.target = 'USER_LOGOUT';
            Activityevents_parent.event = 'LOGIN';
            Activityevents_parent._class = _class_ActivityEvent;
            Activityevents_parent.payload = {
              login_location: {
                latitude: latitude,
                longitude: longitude,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: LoginRequest_.deviceId,
              email: LoginRequest_.email,
            };
            Activityevents_parent.createdAt = current_date;
            Activityevents_parent.updatedAt = current_date;
            Activityevents_parent.sequenceNumber = new Int32(0);
            Activityevents_parent.flowIsDone = false;
            Activityevents_parent.__v = undefined;
            Activityevents_parent.transitions = [
              {
                $ref: 'activityevents',
                $id: Object(generate_activityEventID_Activityevents_child),
                $db: 'hyppe_trans_db',
              },
            ];
            Activityevents_parent.userbasic = data_userbasics._id;

            //Insert ActivityEvent Parent
            const event = await this.activityeventsService.create(Activityevents_parent);
            let idevent = event._id;
            let eventType = event.event.toString();

            await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, data_userbasics._id);
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, Failed create activity events parent. Error:' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            Activityevents_child._id = generate_id_Activityevents_child;
            Activityevents_child.activityEventID = generate_activityEventID_Activityevents_child;
            Activityevents_child.activityType = 'DEVICE_ACTIVITY';
            Activityevents_child.active = true;
            Activityevents_child.status = 'INITIAL';
            Activityevents_child.target = 'ACTIVE';
            Activityevents_child.event = 'AWAKE';
            Activityevents_child._class = _class_ActivityEvent;
            Activityevents_child.payload = {
              login_location: {
                latitude: latitude,
                longitude: longitude,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: LoginRequest_.deviceId,
              email: LoginRequest_.email,
            };
            Activityevents_child.createdAt = current_date;
            Activityevents_child.updatedAt = current_date;
            Activityevents_child.sequenceNumber = new Int32(1);
            Activityevents_child.flowIsDone = false;
            Activityevents_child.__v = undefined;
            Activityevents_child.parentActivityEventID = generate_activityEventID_Activityevents_parent;
            Activityevents_child.userbasic = data_userbasics._id;

            //Insert ActivityEvent Parent


            const event = await this.activityeventsService.create(Activityevents_child);
            let idevent = event._id;
            let eventType = event.event.toString();

            await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, data_userbasics._id);
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, Failed create Activity events Child. Error:' + error,
            );
          }

          var Id_user_userdevices = null;
          //Userdevices != null
          if (await this.utilsService.ceckData(data_userdevices)) {
            //Get Userdevices
            try {
              var data_update = null;
              if (LoginRequest_.devicetype != undefined) {
                data_update = {
                  active: true,
                  devicetype: LoginRequest_.devicetype
                };
                getdevicedata = LoginRequest_.devicetype;
              } else {
                data_update = {
                  active: true
                };
              }
              await this.userdevicesService.updatebyEmail(LoginRequest_.email, LoginRequest_.deviceId, data_update);
              Id_user_userdevices = data_userdevices._id;
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Failed update user devices. Error:' + error,
              );
            }
          } else {
            var CreateUserdeviceDto_ = new CreateUserdeviceDto();
            //Create Userdevices
            try {
              Id_user_userdevices = (await this.utilsService.generateId()).toLowerCase();
              CreateUserdeviceDto_._id = Id_user_userdevices;
              CreateUserdeviceDto_.deviceID = LoginRequest_.deviceId;
              CreateUserdeviceDto_.email = LoginRequest_.email;
              CreateUserdeviceDto_.active = true;
              CreateUserdeviceDto_._class = _class_UserDevices;
              CreateUserdeviceDto_.createdAt = current_date;
              CreateUserdeviceDto_.updatedAt = current_date;
              if (LoginRequest_.devicetype != undefined) {
                CreateUserdeviceDto_.devicetype = LoginRequest_.devicetype;
                getdevicedata = LoginRequest_.devicetype;
              }
              //Insert User Userdevices
              await this.userdevicesService.create(CreateUserdeviceDto_);
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Failed update user devices. Error:' + error,
              );
            }
          }


          //Update Devices Userauths
          try {
            //Get Devices Userauths
            const data_userauths_devices_list = data_userauths.devices;

            //Filter ID_user_userdevicesService Devices UserDevices
            var filteredData = data_userauths_devices_list.filter(function (data_userauths_devices_list) {
              return (JSON.parse(JSON.stringify(data_userauths_devices_list)).$id === Id_user_userdevices);
            });

            if (filteredData.length == 0) {
              //Pust Devices Userauths
              data_userauths_devices_list.push({
                $ref: 'userdevices',
                $id: Object(Id_user_userdevices),
                $db: 'hyppe_trans_db',
              });

              await this.userauthsService.updatebyEmail(LoginRequest_.email, {
                devices: data_userauths_devices_list,
              });
            }
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, Failed update devices userauths. Error:' + error,
            );
          }
        }

        messages_response = 'Login successful';
        var datasetting = await this.settingsService.findAll();

        var CreateUserauthDto_ = new CreateUserauthDto();
        if (LoginRequest_.regSrc == undefined) {
          CreateUserauthDto_.loginSrc = data_userauths.regSrc.toString();
        }else{
          CreateUserauthDto_.loginSrc = LoginRequest_.regSrc.toString();
        }
        this.userauthsService.update2(data_userauths._id.toString(), CreateUserauthDto_);

        var ProfileDTO_ = new ProfileDTO();
        ProfileDTO_ = await this.utilsService.generateProfile(LoginRequest_.email, 'LOGIN');
        ProfileDTO_.token = 'Bearer ' + (await this.utilsService.generateToken(LoginRequest_.email, LoginRequest_.deviceId)).toString();
        ProfileDTO_.refreshToken = data_jwtrefreshtoken.refresh_token_id;
        // ProfileDTO_.devicetype = getdevicedata;
        ProfileDTO_.devicetype = (getdevicedata != null ? getdevicedata : LoginRequest_.devicetype);
        ProfileDTO_.listSetting = datasetting;

        var GlobalResponse_ = new GlobalResponse();
        var GlobalMessages_ = new GlobalMessages();
        GlobalMessages_.info = [messages_response];

        GlobalResponse_.response_code = 202;
        GlobalResponse_.data = ProfileDTO_;
        GlobalResponse_.messages = GlobalMessages_;
        GlobalResponse_.version = (await this.utilsService.getSetting_("62bbdb4ba7520000050077a7")).toString();
        GlobalResponse_.version_ios = (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString();
        return GlobalResponse_;
      } else {
        var messages = "Tidak dapat melanjutkan, Email pengguna belum diverifikasi";
        if (lang == "en") {
          messages = 'Unable to continue, User`s email has not been verified';
        } else {
          messages = "Tidak dapat melanjutkan, Email pengguna belum diverifikasi";
        }
        var response = {
          response_code: 202,
          data: {
            email: LoginRequest_.email,
            isEmailVerified: _isEmailVerified
          },
          messages: {
            info: [messages],
          },
        }
        return response;
        // if (lang == "en") {
        //   await this.errorHandler.generateNotAcceptableException(
        //     'Unable to continue, User`s email has not been verified',
        //   );
        // } else {
        //   await this.errorHandler.generateNotAcceptableException(
        //     'Tidak dapat melanjutkan, Email pengguna belum diverifikasi',
        //   );
        // }
      }
    } else {
      if (await this.utilsService.ceckData(data_userauths)) {
        _isEmailVerified = data_userauths.isEmailVerified;
        var messages = "Tidak dapat melanjutkan, Email pengguna belum diverifikasi";
        if (lang == "en") {
          messages = 'Unable to continue, User`s email has not been verified';
        } else {
          messages = "Tidak dapat melanjutkan, Email pengguna belum diverifikasi";
        }
        var response = {
          response_code: 202,
          data: {
            email: LoginRequest_.email,
            isEmailVerified: _isEmailVerified
          },
          messages: {
            info: [messages],
          },
        }
        return response;
      } else {
        if (lang == "en") {
          await this.errorHandler.generateNotAcceptableException(
            'No users were found. Please check again.',
          );
        } else {
          await this.errorHandler.generateNotAcceptableException(
            'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
          );
        }
      }
    }
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('api/user/refreshtoken')
  @HttpCode(HttpStatus.ACCEPTED)
  async refreshToken(@Body() RefreshTokenRequest_: RefreshTokenRequest, @Headers() headers) {
    //Ceck User Jwtrefreshtoken
    const data_jwtrefreshtokenService =
      await this.jwtrefreshtokenService.findByEmailRefreshToken(RefreshTokenRequest_.email, RefreshTokenRequest_.refreshToken);

    //Ceck User Userbasics
    const data_userbasicsService = await this.userbasicsService.findOne(RefreshTokenRequest_.email);

    if (await this.utilsService.ceckData(data_jwtrefreshtokenService)) {
      var date_exp = await data_jwtrefreshtokenService.exp;
      //Ceck Time Refresh Token Expired
      // if (new Date().getTime() < Number(await date_exp)) {
      //   await this.errorHandler.generateNotAcceptableException(
      //     'Refesh token still valid',
      //   );
      // } else {
      //Ceck User Userauths
      const datauserauthsService = await this.userauthsService.findOneByEmail(RefreshTokenRequest_.email);

      //Get Id Userdevices
      const datauserauthsService_devices = datauserauthsService.devices[datauserauthsService.devices.length - 1];

      //Descrip Token
      var data_token = await this.utilsService.descripToken(headers);

      //Generate Token
      var Token = 'Bearer ' + (await this.utilsService.generateToken(data_userbasicsService.email.toString(), data_token.deviceId));

      //Generate Refresh Token
      var RefreshToken = await this.authService.updateRefreshToken(data_userbasicsService.email.toString());

      var GlobalResponse_ = new GlobalResponse();
      var GlobalMessages_ = new GlobalMessages();
      var ProfileDTO_ = new ProfileDTO();

      ProfileDTO_.token = Token;
      ProfileDTO_.refreshToken = RefreshToken;

      GlobalMessages_.info = ['Refresh Token successful'];

      GlobalResponse_.response_code = 202;
      GlobalResponse_.data = ProfileDTO_;
      GlobalResponse_.messages = GlobalMessages_;
      return GlobalResponse_;
      //}
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/user/logout')
  @HttpCode(HttpStatus.ACCEPTED)
  async logout(@Body() LogoutRequest_: LogoutRequest, @Headers() headers) {
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, email is required',
      );
    }
    var user_email_header = headers['x-auth-user'];
    var user_email = LogoutRequest_.email;
    var user_deviceId = LogoutRequest_.deviceId;
    var current_date = await this.utilsService.getDateTimeString();
    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    if (user_email_header != user_email) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, email not match',
      );
    }

    //Ceck User Userbasics
    const user_userbasics = await this.userbasicsService.findOne(user_email);

    //Ceck Activity Events
    const user_activityevents = await this.activityeventsService.findParent(
      user_email,
      user_deviceId,
      'LOGIN',
      false,
    );

    var id_Activityevents_child = new mongoose.Types.ObjectId();

    //Ceck User Devices
    const user_userdevicesService = await this.userdevicesService.findOneEmail(
      user_email,
      user_deviceId,
    );

    if (await this.utilsService.ceckData(user_userbasics)) {
      if (Object.keys(user_activityevents).length > 0) {
        //Create ActivityEvent Child
        try {
          var latitude_ = undefined;
          var longitude_ = undefined;
          if (user_activityevents[0].payload.login_location != undefined) {
            if (user_activityevents[0].payload.login_location.latitude != undefined) {
              latitude_ = user_activityevents[0].payload.login_location.latitude;
            }
            if (user_activityevents[0].payload.login_location.longitude != undefined) {
              longitude_ = user_activityevents[0].payload.login_location.longitude;
            }
          }
          data_CreateActivityeventsDto_child._id = id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'LOGIN';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'USER_LOGOUT';
          data_CreateActivityeventsDto_child.target = 'COMPLETE';
          data_CreateActivityeventsDto_child.event = 'LOGOUT';
          data_CreateActivityeventsDto_child._class =
            'io.melody.hyppe.trans.domain.ActivityEvent';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: latitude_,
              longitude: longitude_,
            },
            logout_date: current_date,
            login_date: user_activityevents[0].payload.login_date,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
          data_CreateActivityeventsDto_child.flowIsDone = true;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;
          data_CreateActivityeventsDto_child.userbasic = user_userbasics._id;

          //Insert ActivityEvent Child


          const event = await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
          let idevent = event._id;
          let eventType = event.event.toString();

          await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, user_userbasics._id);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity Event Child. Error:' + error,
          );
        }

        //Update ActivityEvent Parent
        try {
          var latitude_ = undefined;
          var longitude_ = undefined;
          if (user_activityevents[0].payload.login_location != undefined) {
            if (user_activityevents[0].payload.login_location.latitude != undefined) {
              latitude_ = user_activityevents[0].payload.login_location.latitude;
            }
            if (user_activityevents[0].payload.login_location.longitude != undefined) {
              longitude_ = user_activityevents[0].payload.login_location.longitude;
            }
          }
          const data_transitions = user_activityevents[0].transitions;
          data_transitions.push({
            $ref: 'activityevents',
            $id: new Object(ID_child_ActivityEvent),
            $db: 'hyppe_trans_db',
          });
          await this.activityeventsService.update(
            {
              _id: user_activityevents[0]._id,
            },
            {
              payload: {
                login_location: {
                  latitude: latitude_,
                  longitude: longitude_,
                },
                logout_date: current_date.substring(
                  0,
                  current_date.lastIndexOf('.'),
                ),
                login_date: user_activityevents[0].payload.login_date,
                login_device: user_deviceId,
                email: user_email,
              },
              flowIsDone: true,
              transitions: data_transitions,
            },
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Activity Event Parent. Error:' + error,
          );
        }

        //Update ActivityEvent All Child True
        try {
          await this.activityeventsService.updateFlowDone(
            user_activityevents[0].activityEventID,
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update ActivityEvent All Child True. Error:' +
            error,
          );
        }

        //Update Userdevices
        try {
          if (user_userdevicesService != null) {
            const datauserauthsService =
              await this.userdevicesService.updatebyEmail(
                user_email,
                user_deviceId,
                {
                  active: false,
                },
              );
          }
          return {
            response_code: 202,
            messages: {
              info: ['Logout successful'],
            },
          };
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Userdevices. Error:' + error,
          );
        }
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, device id not login',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException('Unabled to proceed, User not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/user/deviceactivity')
  @HttpCode(HttpStatus.ACCEPTED)
  async deviceactivity(@Body() DeviceActivityRequest_: DeviceActivityRequest, @Headers() headers) {
    var getDeviceAr = await this.utilsService.getDeepAr("63a3ff2cd42900004b003ec2");
    var getSetting = await this.utilsService.getSetting_("62bbdb4ba7520000050077a7");
    var getSetting_ios = await this.utilsService.getSetting_("645da79c295b0000520048c2");
    var user_email_header = headers['x-auth-user'];
    var user_email = DeviceActivityRequest_.email;
    var user_deviceId = DeviceActivityRequest_.deviceId;
    var user_event = DeviceActivityRequest_.event;
    var user_status = DeviceActivityRequest_.status;
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var id_Activityevents_child = new mongoose.Types.ObjectId();

    if (user_email_header != user_email) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (
      !(
        (user_event == 'AWAKE' && user_status == 'INITIAL') ||
        (user_event == 'SLEEP' && user_status == 'ACTIVE')
      )
    ) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    var target_ = null;
    if (user_event == 'AWAKE') {
      target_ = 'ACTIVE';
    } else if (user_event == 'SLEEP') {
      target_ = 'INACTIVE';
    }

    //Ceck User basics
    const user_userbasics = await this.userbasicsService.findOne(user_email);

    if (await this.utilsService.ceckData(user_userbasics)) {
      //Ceck User ActivityEvent Parent
      const user_activityevents = await this.activityeventsService.findParent(
        user_email,
        user_deviceId,
        'LOGIN',
        false,
      );

      if (Object.keys(user_activityevents).length > 0) {
        var latitude_ = undefined;
        var longitude_ = undefined;
        if (user_activityevents[0].payload.login_location != undefined) {
          if (user_activityevents[0].payload.login_location.latitude != undefined) {
            latitude_ = user_activityevents[0].payload.login_location.latitude;
          }
          if (user_activityevents[0].payload.login_location.longitude != undefined) {
            longitude_ = user_activityevents[0].payload.login_location.longitude;
          }
        }
        //Create ActivityEvent Child
        try {
          data_CreateActivityeventsDto_child._id = id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = user_status;
          data_CreateActivityeventsDto_child.target = target_;
          data_CreateActivityeventsDto_child.event = user_event;
          data_CreateActivityeventsDto_child._class =
            'io.melody.hyppe.trans.domain.ActivityEvent';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: latitude_,
              longitude: longitude_,
            },
            logout_date: current_date,
            login_date: user_activityevents[0].payload.login_date,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
          data_CreateActivityeventsDto_child.flowIsDone = false;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;
          data_CreateActivityeventsDto_child.userbasic = user_userbasics._id;

          //Insert ActivityEvent Child


          const event = await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
          let idevent = event._id;
          let eventType = event.event.toString();

          await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, user_userbasics._id);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity Event Child. Error:' + error,
          );
        }

        //Update ActivityEvent Parent
        try {
          const data_transitions = user_activityevents[0].transitions;
          data_transitions.push({
            $ref: 'activityevents',
            $id: new Object(ID_child_ActivityEvent),
            $db: 'hyppe_trans_db',
          });
          await this.activityeventsService.update(
            {
              _id: user_activityevents[0]._id,
            },
            {
              flowIsDone: false,
              transitions: data_transitions,
            },
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Activity Event Parent. Error:' +
            error,
          );
        }

        return {
          response_code: 202,
          data: getDeviceAr,
          messages: {
            info: ['Device activity logging successful'],
          },
          version: getSetting.toString(),
          version_ios: getSetting_ios.toString(),
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed ',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException('User not found');
    }
  }

  @Post('api/user/recoverpassword')
  @HttpCode(HttpStatus.ACCEPTED)
  async recoverpassword(@Req() request: any) {
    return await this.authService.recoverpasswordV2(request);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('api/user/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('api/user/changepassword')
  @HttpCode(HttpStatus.ACCEPTED)
  async changepassword(@Req() request: any, @Headers() headers) {
    return await this.authService.changepassword(request, headers);
  }

  @Post('api/user/signup')
  @HttpCode(HttpStatus.ACCEPTED)
  async signup(@Req() request: any) {
    return await this.authService.signup2(request);
  }

  @Post('api/user/signup/v2')
  @HttpCode(HttpStatus.ACCEPTED)
  async signupv2(@Req() request: any) {
    return await this.authService.signup2(request);
  }

  @Post('api/user/signuploop')
  @HttpCode(HttpStatus.ACCEPTED)
  async signuploop(@Req() request: any) {

    return await this.authService.signupLoop(request);
  }
  @Post('api/user/verifyaccount')
  @HttpCode(HttpStatus.ACCEPTED)
  async verifyaccount(@Req() request: any) {
    return await this.authService.signup(request);
  }

  @Post('api/user/updateprofile')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateprofile(@Req() request: any, @Headers() headers) {
    return await this.authService.updateprofile(request, headers);
  }

  @Post('api/user/resendotp')
  @HttpCode(HttpStatus.ACCEPTED)
  async resendotp(@Req() request: any) {
    return await this.authService.resendotp(request);
  }

  @Post('api/user/updatelang')
  @HttpCode(HttpStatus.ACCEPTED)
  async updatelang(@Req() request: any, @Headers() headers) {
    return await this.authService.updatelang(request, headers);
  }

  @Post('api/user/referral-count')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral_count(@Req() request: any, @Headers() headers) {
    return await this.authService.referralcount(request, headers);
  }

  @Post('api/user/referral')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral(@Req() request: any, @Headers() headers) {
    return await this.authService.referral2(request, headers);
  }

  @Post('api/user/referral/v2')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral2(@Req() request: any, @Headers() headers) {
    return await this.authService.referral2(request, headers);
  }

  @Post('api/user/referral-qrcode')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral_qrcode(@Req() request: any, @Headers() headers, @Res() response) {
    var data = await this.authService.referralqrcode(request, headers);
    response.set("Content-Type", "image/jpeg");
    response.send(data);
  }

  @Get('profilepict/:id')
  @HttpCode(HttpStatus.OK)
  async profilePict(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaprofilepicts = await this.mediaprofilepictsService.findOne(id);
        console.log(mediaprofilepicts);
        if (await this.utilsService.ceckData(mediaprofilepicts)) {
          if (mediaprofilepicts.uploadSource != undefined) {
            console.log("OSS");
            if (mediaprofilepicts.uploadSource == "OSS") {
              if (mediaprofilepicts.mediaMime != undefined) {
                mediaMime = mediaprofilepicts.mediaMime.toString();
              } else {
                mediaMime = "image/jpeg";
              }

              var path = "";
              if (mediaprofilepicts.mediaThumBasePath != undefined) {
                path = mediaprofilepicts.mediaThumBasePath.toString();
              } else {
                path = mediaprofilepicts.mediaBasePath.toString();
              }
              console.log(path);

              var data2 = await this.ossService.readFile(path);
              console.log(data2);
              if (data2 != null) {
                response.set("Content-Type", "image/jpeg");
                response.send(data2);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            console.log("NON OSS");
            var mediaprofilepicts_fsSourceUri = '';
            var mediaMime = "";
            if (mediaprofilepicts != null) {
              if (mediaprofilepicts.fsSourceUri != null) {
                mediaprofilepicts_fsSourceUri = mediaprofilepicts.fsSourceUri.toString();
              }
            }
            if (mediaprofilepicts.mediaMime != undefined) {
              mediaMime = mediaprofilepicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaprofilepicts_fsSourceUri != '') {
              // const url = "http://172.16.0.5:9555/localrepo/61db97a9548ae516042f0bff/profilepict/0f0f5137-93dd-4c96-a584-bcfde56a5d0b_0001.jpeg";
              // const response_ = await fetch(url);
              // const blob = await response_.blob();
              // const arrayBuffer = await blob.arrayBuffer();
              // const buffer = Buffer.from(arrayBuffer);
              var data = await this.authService.profilePict(mediaprofilepicts_fsSourceUri);
              if (data != null) {
                response.set("Content-Type", mediaMime);
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          }
        } else {
          response.send(null);
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('profilepict/orignal/:id')
  @HttpCode(HttpStatus.OK)
  async profilePictOri(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaprofilepicts = await this.mediaprofilepictsService.findOne(id);
        console.log(mediaprofilepicts);
        if (await this.utilsService.ceckData(mediaprofilepicts)) {
          if (mediaprofilepicts.uploadSource != undefined) {
            console.log("OSS");
            if (mediaprofilepicts.uploadSource == "OSS") {
              if (mediaprofilepicts.mediaMime != undefined) {
                mediaMime = mediaprofilepicts.mediaMime.toString();
              } else {
                mediaMime = "image/jpeg";
              }

              var path = "";
              if (mediaprofilepicts.mediaBasePath != undefined) {
                path = mediaprofilepicts.mediaBasePath.toString();
              } else {
                path = mediaprofilepicts.mediaThumBasePath.toString();
              }
              console.log(path);

              var data2 = await this.ossService.readFile(path);
              console.log(data2);
              if (data2 != null) {
                response.set("Content-Type", "image/jpeg");
                response.send(data2);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            console.log("NON OSS");
            var mediaprofilepicts_fsSourceUri = '';
            var mediaMime = "";
            if (mediaprofilepicts != null) {
              if (mediaprofilepicts.fsSourceUri != null) {
                mediaprofilepicts_fsSourceUri = mediaprofilepicts.fsSourceUri.toString();
              }
            }
            if (mediaprofilepicts.mediaMime != undefined) {
              mediaMime = mediaprofilepicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaprofilepicts_fsSourceUri != '') {
              // const url = "http://172.16.0.5:9555/localrepo/61db97a9548ae516042f0bff/profilepict/0f0f5137-93dd-4c96-a584-bcfde56a5d0b_0001.jpeg";
              // const response_ = await fetch(url);
              // const blob = await response_.blob();
              // const arrayBuffer = await blob.arrayBuffer();
              // const buffer = Buffer.from(arrayBuffer);
              var data = await this.authService.profilePict(mediaprofilepicts_fsSourceUri);
              if (data != null) {
                response.set("Content-Type", mediaMime);
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          }
        } else {
          response.send(null);
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('proofpict/thum/:id')
  @HttpCode(HttpStatus.OK)
  async proofpictThum(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaproofpicts = await this.mediaproofpictsService.findOne(id);
        if (mediaproofpicts.proofpictUploadSource != undefined) {
          if (mediaproofpicts.proofpictUploadSource == "OSS") {
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            var path = "";
            if (mediaproofpicts.mediaThumBasePath != undefined) {
              path = mediaproofpicts.mediaThumBasePath.toString();
            } else {
              path = mediaproofpicts.mediaBasePath.toString();
            }
            var data2 = await this.ossService.readFile(path);
            if (data2 != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data2);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          if (await this.utilsService.ceckData(mediaproofpicts)) {
            var mediaproofpicts_fsSourceUri = '';
            var mediaMime = "";
            if (mediaproofpicts != null) {
              if (mediaproofpicts.fsSourceUri != null) {
                mediaproofpicts_fsSourceUri = mediaproofpicts.fsSourceUri.toString();
              }
            }
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaproofpicts_fsSourceUri != '') {
              // const url = "http://172.16.0.5:9555/localrepo/61db97a9548ae516042f0bff/profilepict/0f0f5137-93dd-4c96-a584-bcfde56a5d0b_0001.jpeg";
              // const response_ = await fetch(url);
              // const blob = await response_.blob();
              // const arrayBuffer = await blob.arrayBuffer();
              // const buffer = Buffer.from(arrayBuffer);
              var data = await this.authService.profilePict(mediaproofpicts_fsSourceUri);
              if (data != null) {
                response.set("Content-Type", mediaMime);
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('proofpict/:id')
  @HttpCode(HttpStatus.OK)
  async proofpict(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaproofpicts = await this.mediaproofpictsService.findOne(id);
        if (mediaproofpicts.proofpictUploadSource != undefined) {
          if (mediaproofpicts.proofpictUploadSource == "OSS") {
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            var data2 = await this.ossService.readFile(mediaproofpicts.mediaBasePath.toString());
            if (data2 != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data2);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          if (await this.utilsService.ceckData(mediaproofpicts)) {
            var mediaproofpicts_fsSourceUri = '';
            var mediaMime = "";
            if (mediaproofpicts != null) {
              if (mediaproofpicts.fsSourceUri != null) {
                mediaproofpicts_fsSourceUri = mediaproofpicts.fsSourceUri.toString();
              }
            }
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaproofpicts_fsSourceUri != '') {
              // const url = "http://172.16.0.5:9555/localrepo/61db97a9548ae516042f0bff/profilepict/0f0f5137-93dd-4c96-a584-bcfde56a5d0b_0001.jpeg";
              // const response_ = await fetch(url);
              // const blob = await response_.blob();
              // const arrayBuffer = await blob.arrayBuffer();
              // const buffer = Buffer.from(arrayBuffer);
              var data = await this.authService.profilePict(mediaproofpicts_fsSourceUri);
              if (data != null) {
                response.set("Content-Type", mediaMime);
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('selfiepict/thum/:id')
  @HttpCode(HttpStatus.OK)
  async selfiepictThum(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaproofpicts = await this.mediaproofpictsService.findOne(id);
        if (mediaproofpicts.SelfieUploadSource != undefined) {
          if (mediaproofpicts.SelfieUploadSource == "OSS") {
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            var path = "";
            if (mediaproofpicts.SelfiemediaThumBasePath != undefined) {
              path = mediaproofpicts.SelfiemediaThumBasePath.toString();
            } else {
              path = mediaproofpicts.mediaSelfieBasePath.toString();
            }
            var data2 = await this.ossService.readFile(path);
            if (data2 != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data2);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          if (await this.utilsService.ceckData(mediaproofpicts)) {
            var mediaproofpicts_SelfiefsSourceUri = '';
            var mediaMime = "";
            if (mediaproofpicts != null) {
              if (mediaproofpicts.SelfiefsSourceUri != null) {
                mediaproofpicts_SelfiefsSourceUri = mediaproofpicts.SelfiefsSourceUri.toString();
              }
            }
            if (mediaproofpicts.SelfiemediaMime != undefined) {
              mediaMime = mediaproofpicts.SelfiemediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaproofpicts_SelfiefsSourceUri != '') {
              // const url = "http://172.16.0.5:9555/localrepo/61db97a9548ae516042f0bff/profilepict/0f0f5137-93dd-4c96-a584-bcfde56a5d0b_0001.jpeg";
              // const response_ = await fetch(url);
              // const blob = await response_.blob();
              // const arrayBuffer = await blob.arrayBuffer();
              // const buffer = Buffer.from(arrayBuffer);
              var data = await this.authService.profilePict(mediaproofpicts_SelfiefsSourceUri);
              if (data != null) {
                response.set("Content-Type", "image/png");
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('selfiepict/:id')
  @HttpCode(HttpStatus.OK)
  async selfiepict(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaproofpicts = await this.mediaproofpictsService.findOne(id);
        if (mediaproofpicts.SelfieUploadSource != undefined) {
          if (mediaproofpicts.SelfieUploadSource == "OSS") {
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            var data2 = await this.ossService.readFile(mediaproofpicts.mediaSelfieBasePath.toString());
            if (data2 != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data2);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          if (await this.utilsService.ceckData(mediaproofpicts)) {
            var mediaproofpicts_SelfiefsSourceUri = '';
            var mediaMime = "";
            if (mediaproofpicts != null) {
              if (mediaproofpicts.SelfiefsSourceUri != null) {
                mediaproofpicts_SelfiefsSourceUri = mediaproofpicts.SelfiefsSourceUri.toString();
              }
            }
            if (mediaproofpicts.SelfiemediaMime != undefined) {
              mediaMime = mediaproofpicts.SelfiemediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaproofpicts_SelfiefsSourceUri != '') {
              // const url = "http://172.16.0.5:9555/localrepo/61db97a9548ae516042f0bff/profilepict/0f0f5137-93dd-4c96-a584-bcfde56a5d0b_0001.jpeg";
              // const response_ = await fetch(url);
              // const blob = await response_.blob();
              // const arrayBuffer = await blob.arrayBuffer();
              // const buffer = Buffer.from(arrayBuffer);
              var data = await this.authService.profilePict(mediaproofpicts_SelfiefsSourceUri);
              if (data != null) {
                response.set("Content-Type", "image/png");
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('supportfile/:id/:index')
  @HttpCode(HttpStatus.OK)
  async supportfile(
    @Param('id') id: string,
    @Param('index') index: number,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined) && (index != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaproofpicts = await this.mediaproofpictsService.findOne(id);
        var datathummb = null;
        var data2 = null;
        if (mediaproofpicts.SupportUploadSource != undefined) {
          if (mediaproofpicts.SupportUploadSource == "OSS") {
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }

            try {
              datathummb = mediaproofpicts.mediaSupportUriThumb;
            } catch (e) {
              datathummb = null;
            }

            if (datathummb !== null && datathummb !== undefined && datathummb.length > 0) {
              var mediaThumb = mediaproofpicts.mediaSupportUriThumb[index].toString();
              // mediaThumb = mediaThumb.replace("http://be-production.oss-ap-southeast-5.aliyuncs.com/", "");
              mediaThumb = mediaThumb.replace("http://be-staging.oss-ap-southeast-5.aliyuncs.com/", "");
              data2 = await this.ossService.readFile(mediaThumb);
            } else {
              data2 = await this.ossService.readFile(mediaproofpicts.SupportfsTargetUri[index].toString());
            }

            if (data2 != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data2);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }
        else {
          if (await this.utilsService.ceckData(mediaproofpicts)) {
            var mediaproofpicts_SupportfsSourceUri = '';
            var mediaMime = "";
            if (mediaproofpicts != null) {
              if (mediaproofpicts.SupportfsSourceUri != null) {
                mediaproofpicts_SupportfsSourceUri = mediaproofpicts.SupportfsSourceUri[index].toString();
              }
            }
            if (mediaproofpicts.SupportmediaMime != undefined) {
              mediaMime = mediaproofpicts.SupportmediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaproofpicts_SupportfsSourceUri != '') {

              var data = await this.authService.profilePict(mediaproofpicts_SupportfsSourceUri);
              if (data != null) {
                response.set("Content-Type", "image/png");
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('akunbank/supportfile/:id/:index')
  @HttpCode(HttpStatus.OK)
  async supportfileakunbank(
    @Param('id') id: string,
    @Param('index') index: number,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined) && (index != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaproofpicts = await this.userbankaccountsService.findOne(id);
        var mediaMime = null;
        if (mediaproofpicts.SupportUploadSource != undefined) {
          if (mediaproofpicts.SupportUploadSource == "OSS") {
            if (mediaproofpicts.SupportmediaMime != undefined) {
              mediaMime = mediaproofpicts.SupportmediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            var data2 = await this.ossService.readFile(mediaproofpicts.mediaSupportUri[index].toString());
            if (data2 != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data2);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }

      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('ticket/supportfile/:id/:index')
  @HttpCode(HttpStatus.OK)
  async supportfileticket(
    @Param('id') id: string,
    @Param('index') index: number,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined) && (index != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaproofpicts = await this.userticketsService.findOneid(id);

        if (mediaproofpicts.UploadSource != undefined) {
          if (mediaproofpicts.UploadSource == "OSS") {
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            var data2 = await this.ossService.readFile(mediaproofpicts.mediaUri[index].toString());
            if (data2 != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data2);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          if (await this.utilsService.ceckData(mediaproofpicts)) {
            var mediaproofpicts_SupportfsSourceUri = '';
            var mediaMime = "";
            if (mediaproofpicts != null) {
              if (mediaproofpicts.fsSourceUri != null) {
                mediaproofpicts_SupportfsSourceUri = mediaproofpicts.fsSourceUri[index].toString();
              }
            }
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaproofpicts_SupportfsSourceUri != '') {
              // const url = "http://172.16.0.5:9555/localrepo/61db97a9548ae516042f0bff/profilepict/0f0f5137-93dd-4c96-a584-bcfde56a5d0b_0001.jpeg";
              // const response_ = await fetch(url);
              // const blob = await response_.blob();
              // const arrayBuffer = await blob.arrayBuffer();
              // const buffer = Buffer.from(arrayBuffer);
              var data = await this.authService.profilePict(mediaproofpicts_SupportfsSourceUri);
              if (data != null) {
                response.set("Content-Type", "image/png");
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('ticket/detail/supportfile/:id/:index')
  @HttpCode(HttpStatus.OK)
  async supportfileticketdetail(
    @Param('id') id: string,
    @Param('index') index: number,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined) && (index != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var mediaproofpicts = await this.userticketdetailsService.findOneid(id);

        if (mediaproofpicts.UploadSource != undefined) {
          if (mediaproofpicts.UploadSource == "OSS") {
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            var data2 = await this.ossService.readFile(mediaproofpicts.mediaUri[index].toString());
            if (data2 != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data2);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          if (await this.utilsService.ceckData(mediaproofpicts)) {
            var mediaproofpicts_SupportfsSourceUri = '';
            var mediaMime = "";
            if (mediaproofpicts != null) {
              if (mediaproofpicts.fsSourceUri != null) {
                mediaproofpicts_SupportfsSourceUri = mediaproofpicts.fsSourceUri[index].toString();
              }
            }
            if (mediaproofpicts.mediaMime != undefined) {
              mediaMime = mediaproofpicts.mediaMime.toString();
            } else {
              mediaMime = "image/jpeg";
            }
            if (mediaproofpicts_SupportfsSourceUri != '') {
              // const url = "http://172.16.0.5:9555/localrepo/61db97a9548ae516042f0bff/profilepict/0f0f5137-93dd-4c96-a584-bcfde56a5d0b_0001.jpeg";
              // const response_ = await fetch(url);
              // const blob = await response_.blob();
              // const arrayBuffer = await blob.arrayBuffer();
              // const buffer = Buffer.from(arrayBuffer);
              var data = await this.authService.profilePict(mediaproofpicts_SupportfsSourceUri);
              if (data != null) {
                response.set("Content-Type", "image/png");
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('api/userauths/:email')
  async updateRole(
    @Param('email') email: string, @Req() request: any, @Headers() headers) {
    return await this.authService.updateRole(email, headers, request);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/user/noneactive')
  async noneActive(@Req() request: any, @Headers() headers) {
    if (request.body.email == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Param email is required',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email header dan token not match',
      );
    }
    if (request.body.email != headers['x-auth-user']) {
      console.log("ok");
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Param email dan email header not match',
      );
    }

    try {
      //Ceck User Userbasics
      const user_userbasics = await this.userbasicsService.findOne(request.body.email);
      //Ceck User Userauths
      const datauserauthsService = await this.userauthsService.findOneByEmail(request.body.email);
      if (await this.utilsService.ceckData(user_userbasics)) {
        await this.userbasicsService.updateNoneActive(request.body.email);
        await this.userauthsService.updateNoneActive(request.body.email);
        await this.userdevicesService.updateNoneActive(request.body.email);
        await this.postsService.updateNoneActive(request.body.email);
        await this.contenteventsService.updateNoneActive(request.body.email);
        await this.insightsService.updateNoneActive(request.body.email);
        return {
          "response_code": 202,
          "messages": {
            "info": [
              "The process successful, User is not Active"
            ]
          }
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, User not found',
        );
      }
    } catch (e) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, ' + e,
      );
    }
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/user/signup/socmed')
  async signupsosmed(@Req() request: any) {
    this.logger.log("signupsosmed >>> start: " + JSON.stringify(request.body));
    return await this.socmed.signupsosmed(request);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/sign/socmed')
  async signsosmed(@Req() request: any) {
    this.logger.log("signsosmed >>> start: " + JSON.stringify(request.body));
    var deviceId = null;
    var socmedSource = null;
    var devicetype = null;
    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["socmedSource"] !== undefined) {
      socmedSource = request_json["socmedSource"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["deviceId"] !== undefined) {
      deviceId = request_json["deviceId"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["devicetype"] !== undefined) {
      devicetype = request_json["devicetype"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    return await this.authService.signsosmed(request);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/user/getuserprofile/byusername')
  @FormDataRequest()
  async getUserProfileByUsername(@Body() SearchUserbasicDto_: SearchUserbasicDto, @Headers() headers) {
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
    if (SearchUserbasicDto_.search == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    //Ceck User Userbasics
    const tmp = await this.userauthsService.findOneUsername(SearchUserbasicDto_.search.toString());
    if (tmp === undefined) {
      return {
        "response_code": 202,
        "data": [],
        "messages": {
          "info": [
            "The process successful"
          ]
        }
      };
    }

    const data_userbasics = await this.userbasicsService.findOne(tmp.email.toString());
    if (await this.utilsService.ceckData(data_userbasics)) {

      var user_view = headers['x-auth-user'];
      await this.authService.viewProfile(tmp.email.toString(), user_view);
      var Data = await this.utilsService.generateProfile(tmp.email.toString(), 'PROFILE');
      var numPost = await this.postsService.findUserPost(tmp.email.toString());
      let aNumPost = <any>numPost;
      Data.insight.posts = <Long>aNumPost;
      return {
        "response_code": 202,
        "data": [Data],
        "messages": {
          "info": [
            "The process successful"
          ]
        }
      };
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/user/getuserprofile')
  @FormDataRequest()
  async getuserprofile(@Body() SearchUserbasicDto_: SearchUserbasicDto, @Headers() headers) {
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
    if (SearchUserbasicDto_.search == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (await this.utilsService.validasiEmail(SearchUserbasicDto_.search.toString())) {
      //Ceck User Userbasics
      const data_userbasics = await this.userbasicsService.findOne(SearchUserbasicDto_.search.toString());
      if (await this.utilsService.ceckData(data_userbasics)) {

        var user_view = headers['x-auth-user'];
        await this.authService.viewProfile(SearchUserbasicDto_.search.toString(), user_view);
        var Data = await this.utilsService.generateProfile(SearchUserbasicDto_.search.toString(), 'PROFILE');
        var numPost = await this.postsService.findUserPost(SearchUserbasicDto_.search.toString());
        let aNumPost = <any>numPost;
        Data.insight.posts = <Long>aNumPost;
        return {
          "response_code": 202,
          "data": [Data],
          "messages": {
            "info": [
              "The process successful"
            ]
          }
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed user not found',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed wrong format email',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/user/profileinterest')
  async profileinterest(@Req() request: any, @Headers() headers) {
    var user_email = null;
    var user_interest = null;
    var user_langIso = null;
    var data_interest_id = [];
    var get_languages = null;

    if (headers['x-auth-user'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed Unauthorized email header dan token not match',
      );
    }
    if (request.body.email == undefined || request.body.interest == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    } else {
      user_email = request.body.email;
      user_interest = request.body.interest;
    }

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    if (await this.utilsService.ceckData(datauserbasicsService)) {

      //Get Id Language
      try {
        if (datauserbasicsService.languages != undefined) {
          var languages_json = JSON.parse(JSON.stringify(datauserbasicsService.languages));
          get_languages = await this.languagesService.findOne(languages_json.$id);
        }
      } catch (error) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed Get Id Language. Error: ' + error,
        );
      }

      if (get_languages != null) {
        user_langIso = get_languages.langIso;
      }

      //Get Id Interest
      try {
        if (user_interest != undefined) {
          if (user_interest.length > 0) {
            for (var i = 0; i < user_interest.length; i++) {
              var id_interest = user_interest[i];
              // await this.interestsRepoService.findOneByInterestNameLangIso(
              //   user_interest[i], user_langIso
              // );
              if (id_interest != undefined) {
                data_interest_id.push({
                  $ref: 'interests_repo',
                  $id: new Types.ObjectId(id_interest),
                  $db: 'hyppe_infra_db',
                });
              }
            }
          }
        }
      } catch (error) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed Get Id Interest. Error: ' + error,
        );
      }

      var data_update = {
        userInterests: data_interest_id
      }
      if (data_interest_id.length > 0) {
        await this.userbasicsService.updatebyEmail(user_email, data_update);
      }
      return {
        "response_code": 202,
        "messages": {
          "info": [
            "Update Profile interest successful"
          ]
        }
      };
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed User nor found',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/user/pin/')
  async createorupdatdePin(@Body() body_, @Headers() headers) {
    if (headers['x-auth-user'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, email header is required',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, token email header not match',
      );
    }
    if (body_.type == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param type is required',
      );
    }
    if (body_.event == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param event is required',
      );
    }
    if (body_.status == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param status is required',
      );
    }
    var user_email = headers['x-auth-user'];
    var lang = await this.utilsService.getUserlanguages(user_email.toString());
    var user_otp = null;
    var type = null;
    var otp_attemp = null;
    var current_date_string = await this.utilsService.getDateTimeString();
    var current_date = new Date();
    //var setting_ExpiredTimeOTPPin = await this.utilsService.getSetting("ExpiredTimeOTPPin");
    //var setting_MaxWrongOTPPIN = await this.utilsService.getSetting("MaxWrongOTPPIN");
    var setting_ExpiredTimeOTPPin = await this.utilsService.getSetting_("63183f5a1d4c0000c2000552");
    var setting_MaxWrongOTPPIN = await this.utilsService.getSetting_("631eb8e421490000a1002533");

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var ID_parent_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
    var ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
    var ID_child_ActivityEvent_2 = (await this.utilsService.generateId()).toLowerCase();

    if (body_.type == "CREATE_PIN") {
      type = "CREATE_PIN";
    } else if (body_.type == "CHANGE_PIN") {
      type = "CHANGE_PIN";
    } else if (body_.type == "CECK_PIN") {
      type = "CECK_PIN";
    } else if (body_.type == "FORGOT_PIN") {
      type = "FORGOT_PIN";
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, type cannot be processed',
      );
    }

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    //Ceck User Auth
    const user_userAuth = await this.userauthsService.findOne(user_email);

    if (await this.utilsService.ceckData(datauserbasicsService)) {
      if (await this.utilsService.ceckData(user_userAuth)) {
        //Ceck User ActivityEvent Parent
        const user_activityevents = await this.activityeventsService.findParentWitoutDevice(user_email, type, false,);
        if (Object.keys(user_activityevents).length > 0) {
          if (type == "FORGOT_PIN") {
            let last;
            const count_transition = user_activityevents[0].transitions.length;
            if (user_activityevents[0].transitions.length > 0) {
              last = await this.activityeventsService.findbyactivityEventID(user_email, user_activityevents[0].transitions[count_transition - 1].oid, type, false,);
            } else {
              last = user_activityevents;
            }

            let StatusNext;
            let EventNext;

            if (last[0].status == 'NOTIFY') {
              StatusNext = 'REPLY';
              EventNext = 'VERIFY_OTP';
            } else if (last[0].status == 'REPLY') {
              StatusNext = 'INITIAL';
              EventNext = 'CREATE_PIN';
            } else if (last[0].status == 'INITIAL') {
              StatusNext = user_activityevents[0].status;
              EventNext = user_activityevents[0].event;
            }

            if ('otp' in body_) {
              user_otp = body_.otp;
            }

            const StatusCurrent = body_.status;
            const EventCurrent = body_.event;

            if (
              StatusNext == 'REPLY' &&
              StatusNext == StatusCurrent &&
              EventNext == EventCurrent
            ) {
              if (
                datauserbasicsService.otp_pin != undefined &&
                EventCurrent == 'VERIFY_OTP' &&
                StatusCurrent == 'REPLY'
              ) {
                if (datauserbasicsService.otp_attemp == undefined) {
                  otp_attemp = 0;
                } else {
                  otp_attemp = datauserbasicsService.otp_attemp;
                }

                if (otp_attemp < Number(setting_MaxWrongOTPPIN)) {
                  console.log(new Date().getTime());
                  console.log(Number(await datauserbasicsService.otp_expired_time));
                  console.log((new Date().getTime() > Number(await datauserbasicsService.otp_expired_time)));
                  if (
                    (datauserbasicsService.otp_pin != undefined
                      ? (new Date().getTime() > Number(await datauserbasicsService.otp_expired_time))
                      : false) == false &&
                    user_otp == datauserbasicsService.otp_pin
                  ) {

                    //Create ActivityEvent child
                    try {
                      var id_child = new mongoose.Types.ObjectId();
                      data_CreateActivityeventsDto_child._id = id_child;
                      data_CreateActivityeventsDto_child.activityEventID =
                        ID_child_ActivityEvent;
                      data_CreateActivityeventsDto_child.activityType = type;
                      data_CreateActivityeventsDto_child.active = true;
                      data_CreateActivityeventsDto_child.status = StatusCurrent;
                      data_CreateActivityeventsDto_child.target = 'CHANGE';
                      data_CreateActivityeventsDto_child.event = EventCurrent;
                      data_CreateActivityeventsDto_child.action =
                        'VerifyActivityCommand';
                      data_CreateActivityeventsDto_child._class =
                        'io.melody.hyppe.trans.domain.ActivityEvent';
                      data_CreateActivityeventsDto_child.payload = {
                        login_location: {
                          latitude: undefined,
                          longitude: undefined,
                        },
                        logout_date: undefined,
                        login_date: undefined,
                        login_device: undefined,
                        email: user_email,
                      };
                      data_CreateActivityeventsDto_child.createdAt = current_date_string;
                      data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                      data_CreateActivityeventsDto_child.sequenceNumber =
                        new Int32(2);
                      data_CreateActivityeventsDto_child.flowIsDone = false;
                      data_CreateActivityeventsDto_child.parentActivityEventID =
                        user_activityevents[0].activityEventID;
                      data_CreateActivityeventsDto_child.userbasic =
                        datauserbasicsService._id;

                      //Insert ActivityEvent child
                      await this.activityeventsService.create(
                        data_CreateActivityeventsDto_child,
                      );
                    } catch (error) {
                      await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create Activity events Child. Error:' +
                        error,
                      );
                    }

                    //Update ActivityEvent Parent
                    try {
                      const data_transitions = user_activityevents[0].transitions;
                      data_transitions.push({
                        $ref: 'activityevents',
                        $id: new Object(ID_child_ActivityEvent),
                        $db: 'hyppe_trans_db',
                      });
                      await this.activityeventsService.update(
                        {
                          _id: user_activityevents[0]._id,
                        },
                        {
                          payload: {
                            login_location: {
                              latitude: undefined,
                              longitude: undefined,
                            },
                            logout_date: undefined,
                            login_date: user_activityevents[0].payload.login_date,
                            login_device: undefined,
                            email: user_email,
                          },
                          flowIsDone: false,
                          transitions: data_transitions,
                        },
                      );
                    } catch (error) {
                      await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Update Activity Event Parent. Error:' +
                        error,
                      );
                    }

                    var createUserbasicDto_ = new CreateUserbasicDto();
                    createUserbasicDto_.otp_pin = null;
                    createUserbasicDto_.otp_request_time = new Long(0);
                    createUserbasicDto_.otp_expired_time = new Long(0);
                    createUserbasicDto_.otp_attemp = 0;
                    createUserbasicDto_.otppinVerified = true;
                    await this.userbasicsService.updateData(user_email, createUserbasicDto_);

                    return {
                      response_code: 202,
                      messages: {
                        info: ['Verify OTP successful'],
                      },
                    };
                  } else {
                    await this.userbasicsService.findOneupdatebyEmail(user_email);
                    var messages = "";
                    if (lang == "en") {
                      messages = "The OTP code you entered is incorrect; please check again.";
                    } else {
                      messages = "Kode OTP yang kamu masukan salah, silahkan cek kembali.";
                    }
                    await this.errorHandler.generateNotAcceptableException(
                      messages,
                    );
                  }
                } else {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, OTP Max Wrong',
                  );
                }
              } else {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed',
                );
              }
            } else if (
              StatusNext == 'INITIAL' &&
              StatusNext == StatusCurrent &&
              EventNext == EventCurrent
            ) {

              let data_transitions = user_activityevents[0].transitions;

              //Create ActivityEvent child
              try {
                var id_child = new mongoose.Types.ObjectId();
                data_CreateActivityeventsDto_child._id = id_child;
                data_CreateActivityeventsDto_child.activityEventID =
                  ID_child_ActivityEvent;
                data_CreateActivityeventsDto_child.activityType = type;
                data_CreateActivityeventsDto_child.active = true;
                data_CreateActivityeventsDto_child.status = 'INITIAL';
                data_CreateActivityeventsDto_child.target = 'COMPLETE';
                data_CreateActivityeventsDto_child.event = 'CREATE_PIN';
                data_CreateActivityeventsDto_child._class =
                  'io.melody.hyppe.trans.domain.ActivityEvent';
                data_CreateActivityeventsDto_child.payload = {
                  login_location: {
                    latitude: undefined,
                    longitude: undefined,
                  },
                  logout_date: undefined,
                  login_date: undefined,
                  login_device: undefined,
                  email: user_email,
                };
                data_CreateActivityeventsDto_child.createdAt = current_date_string;
                data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                  3,
                );
                data_CreateActivityeventsDto_child.flowIsDone = false;
                data_CreateActivityeventsDto_child.parentActivityEventID =
                  user_activityevents[0].activityEventID;
                data_CreateActivityeventsDto_child.userbasic =
                  datauserbasicsService._id;

                //Insert ActivityEvent child
                await this.activityeventsService.create(
                  data_CreateActivityeventsDto_child,
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Activity events Child. Error:' +
                  error,
                );
              }

              //Update ActivityEvent Parent
              try {
                data_transitions = user_activityevents[0].transitions;
                data_transitions.push({
                  $ref: 'activityevents',
                  $id: new Object(ID_child_ActivityEvent),
                  $db: 'hyppe_trans_db',
                });

                //Update ActivityEvent Parent
                const update_activityevents_parent =
                  await this.activityeventsService.update(
                    {
                      _id: user_activityevents[0]._id,
                    },
                    {
                      transitions: data_transitions,
                    },
                  );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Update Activity events Parent. Error:' +
                  error,
                );
              }

              //Update Pin
              try {
                var encrypt_pin = await this.utilsService.encrypt(body_.pin.toString());
                var createUserbasicDto_ = new CreateUserbasicDto();
                createUserbasicDto_.pin = encrypt_pin;
                await this.userbasicsService.updateData(user_email, createUserbasicDto_);
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Pin. Error: ' +
                  error,
                );
              }

              //Create ActivityEvent child
              try {
                var id_child = new mongoose.Types.ObjectId();
                data_CreateActivityeventsDto_child._id = id_child;
                data_CreateActivityeventsDto_child.activityEventID =
                  ID_child_ActivityEvent_2;
                data_CreateActivityeventsDto_child.activityType = type;
                data_CreateActivityeventsDto_child.active = true;
                data_CreateActivityeventsDto_child.status = 'COMPLETE';
                data_CreateActivityeventsDto_child.target = 'COMPLETE';
                data_CreateActivityeventsDto_child.event = 'COMPLETE';
                data_CreateActivityeventsDto_child.action =
                  'VerifyActivityCommand';
                data_CreateActivityeventsDto_child._class =
                  'io.melody.hyppe.trans.domain.ActivityEvent';
                data_CreateActivityeventsDto_child.payload = {
                  login_location: {
                    latitude: undefined,
                    longitude: undefined,
                  },
                  logout_date: undefined,
                  login_date: undefined,
                  login_device: undefined,
                  email: user_email,
                };
                data_CreateActivityeventsDto_child.createdAt = current_date_string;
                data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                data_CreateActivityeventsDto_child.sequenceNumber =
                  new Int32(4);
                data_CreateActivityeventsDto_child.flowIsDone = false;
                data_CreateActivityeventsDto_child.parentActivityEventID =
                  user_activityevents[0].activityEventID;
                data_CreateActivityeventsDto_child.userbasic =
                  datauserbasicsService._id;

                //Insert ActivityEvent child
                await this.activityeventsService.create(
                  data_CreateActivityeventsDto_child,
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Activity events Child. Error:' +
                  error,
                );
              }

              //Update ActivityEvent Parent
              try {
                data_transitions.push({
                  $ref: 'activityevents',
                  $id: new Object(ID_child_ActivityEvent_2),
                  $db: 'hyppe_trans_db',
                });

                //Update ActivityEvent Parent
                const update_activityevents_parent =
                  await this.activityeventsService.update(
                    {
                      _id: user_activityevents[0]._id,
                    },
                    {
                      transitions: data_transitions,
                    },
                  );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Update Activity events Parent. Error:' +
                  error,
                );
              }

              //Update ActivityEvent All Child True
              try {
                await this.activityeventsService.updateFlowDone(
                  user_activityevents[0].activityEventID,
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Update ActivityEvent All Child True. Error:' +
                  error,
                );
              }

              return {
                response_code: 202,
                messages: {
                  info: ['Create PIN request successful'],
                },
              };
            } else {
              //Create ActivityEvent child
              try {
                var id_child = new mongoose.Types.ObjectId();
                data_CreateActivityeventsDto_child._id = id_child;
                data_CreateActivityeventsDto_child.activityEventID =
                  ID_child_ActivityEvent;
                data_CreateActivityeventsDto_child.activityType = type;
                data_CreateActivityeventsDto_child.active = true;
                data_CreateActivityeventsDto_child.status = 'NOTIFY';
                data_CreateActivityeventsDto_child.target = 'REPLY';
                data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                data_CreateActivityeventsDto_child._class =
                  'io.melody.hyppe.trans.domain.ActivityEvent';
                data_CreateActivityeventsDto_child.action =
                  'NotifyActivityCommand';
                data_CreateActivityeventsDto_child.payload = {
                  login_location: {
                    latitude: undefined,
                    longitude: undefined,
                  },
                  logout_date: undefined,
                  login_date: undefined,
                  login_device: undefined,
                  email: user_email,
                };
                data_CreateActivityeventsDto_child.createdAt = current_date_string;
                data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
                data_CreateActivityeventsDto_child.flowIsDone = false;
                data_CreateActivityeventsDto_child.__v = undefined;
                data_CreateActivityeventsDto_child.parentActivityEventID =
                  user_activityevents[0].activityEventID;
                data_CreateActivityeventsDto_child.userbasic =
                  datauserbasicsService._id;

                //Insert ActivityEvent Parent
                await this.activityeventsService.create(
                  data_CreateActivityeventsDto_child,
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Activity events Child. Error: ' +
                  error,
                );
              }

              //Update ActivityEvent Parent
              try {
                const data_transitions = user_activityevents[0].transitions;
                data_transitions.push({
                  $ref: 'activityevents',
                  $id: new Object(ID_child_ActivityEvent),
                  $db: 'hyppe_trans_db',
                });

                //Update ActivityEvent Parent
                await this.activityeventsService.update(
                  {
                    _id: user_activityevents[0]._id,
                  },
                  {
                    transitions: data_transitions,
                  },
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Update Activity events Parent. Error:' +
                  error,
                );
              }

              //Generate OTP
              try {
                var OTP = await this.utilsService.generateOTP();
                var OTP_request_time = current_date.getTime();
                var OTP_expired_time = (current_date.setMinutes(current_date.getMinutes() + Number(setting_ExpiredTimeOTPPin)));


                console.log(new Date().getTime());
                console.log(OTP_expired_time);
                console.log((new Date().getTime() > OTP_expired_time));


                var createUserbasicDto_ = new CreateUserbasicDto();
                createUserbasicDto_.otp_pin = OTP;
                createUserbasicDto_.otp_attemp = 0;
                createUserbasicDto_.otppinVerified = false;
                createUserbasicDto_.otp_request_time = Long.fromString(OTP_request_time.toString());
                createUserbasicDto_.otp_expired_time = Long.fromString(OTP_expired_time.toString());
                await this.userbasicsService.updateData(user_email, createUserbasicDto_);

                await this.authService.sendemailOTP(
                  user_userAuth.email.toString(),
                  OTP.toString(),
                  'RECOVER_PASS',
                );

                return {
                  response_code: 202,
                  messages: {
                    info: ['Request forgot PIN request successful'],
                  },
                };
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Generate OTP. Error: ' + error,
                );
              }
            }
          } else {
            let last;
            if (user_activityevents[0].transitions.length > 0) {
              last = await this.activityeventsService.findbyactivityEventID(user_email, user_activityevents[0].transitions[0].oid, type, false,);
            } else {
              last = user_activityevents;
            }

            let StatusNext;
            let EventNext;
            if (last[0].status == 'NOTIFY') {
              StatusNext = 'REPLY';
              EventNext = 'VERIFY_OTP';
            } else if (last[0].status == 'INITIAL') {
              StatusNext = user_activityevents[0].status;
              EventNext = user_activityevents[0].event;
            }
            if ('otp' in body_) {
              user_otp = body_.otp;
            }
            const StatusCurrent = body_.status;
            const EventCurrent = body_.event;

            if (
              StatusNext == 'REPLY' &&
              StatusNext == StatusCurrent &&
              EventNext == EventCurrent
            ) {
              if (
                datauserbasicsService.otp_pin != undefined &&
                EventCurrent == 'VERIFY_OTP' &&
                StatusCurrent == 'REPLY'
              ) {

                //Create ActivityEvent child
                try {
                  var id_child = new mongoose.Types.ObjectId();
                  data_CreateActivityeventsDto_child._id = id_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = type;
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = StatusCurrent;
                  data_CreateActivityeventsDto_child.target = 'COMPLETE';
                  data_CreateActivityeventsDto_child.event = EventCurrent;
                  data_CreateActivityeventsDto_child.action =
                    'VerifyActivityCommand';
                  data_CreateActivityeventsDto_child._class =
                    'io.melody.hyppe.trans.domain.ActivityEvent';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: undefined,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date_string;
                  data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    3,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    user_activityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;

                  //Insert ActivityEvent child
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error:' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = user_activityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });

                  //Update ActivityEvent Parent
                  const update_activityevents_parent =
                    await this.activityeventsService.update(
                      {
                        _id: user_activityevents[0]._id,
                      },
                      {
                        transitions: data_transitions,
                      },
                    );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity events Parent. Error:' +
                    error,
                  );
                }

                if (datauserbasicsService.otp_attemp == undefined) {
                  otp_attemp = 0;
                } else {
                  otp_attemp = datauserbasicsService.otp_attemp;
                }

                if (otp_attemp < Number(setting_MaxWrongOTPPIN)) {
                  if (
                    (datauserbasicsService.otp_pin != undefined
                      ? (new Date().getTime() > Number(await datauserbasicsService.otp_expired_time))
                      : false) == false &&
                    user_otp == datauserbasicsService.otp_pin
                  ) {

                    //Create ActivityEvent child
                    try {
                      var id_child = new mongoose.Types.ObjectId();
                      data_CreateActivityeventsDto_child._id = id_child;
                      data_CreateActivityeventsDto_child.activityEventID =
                        ID_child_ActivityEvent;
                      data_CreateActivityeventsDto_child.activityType = type;
                      data_CreateActivityeventsDto_child.active = true;
                      data_CreateActivityeventsDto_child.status = 'COMPLETE';
                      data_CreateActivityeventsDto_child.target = 'COMPLETE';
                      data_CreateActivityeventsDto_child.event = 'COMPLETE';
                      data_CreateActivityeventsDto_child.action =
                        'VerifyActivityCommand';
                      data_CreateActivityeventsDto_child._class =
                        'io.melody.hyppe.trans.domain.ActivityEvent';
                      data_CreateActivityeventsDto_child.payload = {
                        login_location: {
                          latitude: undefined,
                          longitude: undefined,
                        },
                        logout_date: undefined,
                        login_date: undefined,
                        login_device: undefined,
                        email: user_email,
                      };
                      data_CreateActivityeventsDto_child.createdAt = current_date_string;
                      data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                      data_CreateActivityeventsDto_child.sequenceNumber =
                        new Int32(4);
                      data_CreateActivityeventsDto_child.flowIsDone = false;
                      data_CreateActivityeventsDto_child.parentActivityEventID =
                        user_activityevents[0].activityEventID;
                      data_CreateActivityeventsDto_child.userbasic =
                        datauserbasicsService._id;

                      //Insert ActivityEvent child
                      await this.activityeventsService.create(
                        data_CreateActivityeventsDto_child,
                      );
                    } catch (error) {
                      await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create Activity events Child. Error:' +
                        error,
                      );
                    }

                    //Update ActivityEvent Parent
                    try {
                      const data_transitions = user_activityevents[0].transitions;
                      data_transitions.push({
                        $ref: 'activityevents',
                        $id: new Object(ID_child_ActivityEvent),
                        $db: 'hyppe_trans_db',
                      });
                      await this.activityeventsService.update(
                        {
                          _id: user_activityevents[0]._id,
                        },
                        {
                          payload: {
                            login_location: {
                              latitude: undefined,
                              longitude: undefined,
                            },
                            logout_date: undefined,
                            login_date: user_activityevents[0].payload.login_date,
                            login_device: undefined,
                            email: user_email,
                          },
                          flowIsDone: true,
                          transitions: data_transitions,
                        },
                      );
                    } catch (error) {
                      await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Update Activity Event Parent. Error:' +
                        error,
                      );
                    }

                    //Update ActivityEvent All Child True
                    try {
                      await this.activityeventsService.updateFlowDone(
                        user_activityevents[0].activityEventID,
                      );
                    } catch (error) {
                      await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Update ActivityEvent All Child True. Error:' +
                        error,
                      );
                    }

                    var createUserbasicDto_ = new CreateUserbasicDto();
                    createUserbasicDto_.pin = encrypt_pin;
                    createUserbasicDto_.otp_pin = null;
                    createUserbasicDto_.otp_request_time = new Long(0);
                    createUserbasicDto_.otp_expired_time = new Long(0);
                    createUserbasicDto_.otp_attemp = 0;
                    createUserbasicDto_.otppinVerified = true;
                    await this.userbasicsService.updateData(user_email, createUserbasicDto_);

                    return {
                      response_code: 202,
                      messages: {
                        info: ['Verify OTP successful'],
                      },
                    };
                  } else {
                    await this.userbasicsService.findOneupdatebyEmail(user_email);
                    var messages = "";
                    if (lang == "en") {
                      messages = "The OTP code you entered is incorrect; please check again.";
                    } else {
                      messages = "Kode OTP yang kamu masukan salah, silahkan cek kembali.";
                    }
                    await this.errorHandler.generateNotAcceptableException(
                      messages,
                    );
                  }
                } else {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, OTP Max Wrong',
                  );
                }
              } else if (
                datauserbasicsService.otp_pin != undefined &&
                EventCurrent == 'NOTIFY_OTP' &&
                StatusCurrent == 'NOTIFY'
              ) {

                //Create ActivityEvent child
                try {
                  var id_child = new mongoose.Types.ObjectId();
                  data_CreateActivityeventsDto_child._id = id_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = type;
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'NOTIFY';
                  data_CreateActivityeventsDto_child.target = 'REPLY';
                  data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                  data_CreateActivityeventsDto_child._class =
                    'io.melody.hyppe.trans.domain.ActivityEvent';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: undefined,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date_string;
                  data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    3,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    user_activityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;

                  //Insert ActivityEvent child
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error:' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = user_activityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });

                  //Update ActivityEvent Parent
                  const update_activityevents_parent =
                    await this.activityeventsService.update(
                      {
                        _id: user_activityevents[0]._id,
                      },
                      {
                        transitions: data_transitions,
                      },
                    );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity events Parent. Error:' +
                    error,
                  );
                }

                //Generate OTP
                try {
                  var OTP = await this.utilsService.generateOTP();
                  var OTP_request_time = current_date.getTime();
                  var OTP_expired_time = (current_date.setMinutes(current_date.getMinutes() + Number(setting_ExpiredTimeOTPPin)));

                  var createUserbasicDto_ = new CreateUserbasicDto();
                  createUserbasicDto_.otp_pin = OTP;
                  createUserbasicDto_.otp_attemp = 0;
                  createUserbasicDto_.otp_request_time = Long.fromString(OTP_request_time.toString());
                  createUserbasicDto_.otp_expired_time = Long.fromString(OTP_expired_time.toString());
                  await this.userbasicsService.updateData(user_email, createUserbasicDto_);

                  await this.authService.sendemailOTP(
                    user_userAuth.email.toString(),
                    OTP.toString(),
                    'RECOVER_PASS',
                  );

                  return {
                    response_code: 202,
                    messages: {
                      info: ['Request create PIN request successful'],
                    },
                  };
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Gnerate OTP. Error: ' + error,
                  );
                }
              } else {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed',
                );
              }
            } else {
              //Create ActivityEvent child
              try {
                var id_child = new mongoose.Types.ObjectId();
                data_CreateActivityeventsDto_child._id = id_child;
                data_CreateActivityeventsDto_child.activityEventID =
                  ID_child_ActivityEvent;
                data_CreateActivityeventsDto_child.activityType = type;
                data_CreateActivityeventsDto_child.active = true;
                data_CreateActivityeventsDto_child.status = 'NOTIFY';
                data_CreateActivityeventsDto_child.target = 'REPLY';
                data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                data_CreateActivityeventsDto_child._class =
                  'io.melody.hyppe.trans.domain.ActivityEvent';
                data_CreateActivityeventsDto_child.action =
                  'NotifyActivityCommand';
                data_CreateActivityeventsDto_child.payload = {
                  login_location: {
                    latitude: undefined,
                    longitude: undefined,
                  },
                  logout_date: undefined,
                  login_date: undefined,
                  login_device: undefined,
                  email: user_email,
                };
                data_CreateActivityeventsDto_child.createdAt = current_date_string;
                data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
                data_CreateActivityeventsDto_child.flowIsDone = false;
                data_CreateActivityeventsDto_child.__v = undefined;
                data_CreateActivityeventsDto_child.parentActivityEventID =
                  user_activityevents[0].activityEventID;
                data_CreateActivityeventsDto_child.userbasic =
                  datauserbasicsService._id;

                //Insert ActivityEvent Parent
                await this.activityeventsService.create(
                  data_CreateActivityeventsDto_child,
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Activity events Child. Error: ' +
                  error,
                );
              }

              //Update ActivityEvent Parent
              try {
                const data_transitions = user_activityevents[0].transitions;
                data_transitions.push({
                  $ref: 'activityevents',
                  $id: new Object(ID_child_ActivityEvent),
                  $db: 'hyppe_trans_db',
                });

                //Update ActivityEvent Parent
                await this.activityeventsService.update(
                  {
                    _id: user_activityevents[0]._id,
                  },
                  {
                    transitions: data_transitions,
                  },
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Update Activity events Parent. Error:' +
                  error,
                );
              }

              var OTP = await this.utilsService.generateOTP();
              var OTP_request_time = current_date.getTime();
              var OTP_expired_time = (current_date.setMinutes(current_date.getMinutes() + Number(setting_ExpiredTimeOTPPin)));

              var createUserbasicDto_ = new CreateUserbasicDto();
              createUserbasicDto_.otp_pin = OTP;
              createUserbasicDto_.otp_attemp = 0;
              createUserbasicDto_.otp_request_time = Long.fromString(OTP_request_time.toString());
              createUserbasicDto_.otp_expired_time = Long.fromString(OTP_expired_time.toString());
              await this.userbasicsService.updateData(user_email, createUserbasicDto_);

              await this.authService.sendemailOTP(
                user_userAuth.email.toString(),
                OTP.toString(),
                'RECOVER_PASS',
              );

              var messages = "";
              if (lang == "en") {
                messages = "Email Sent, We have sent a verification code to your email.";
              } else {
                messages = "Email Terkirim, Kami telah mengirimkan kode verifikasi ke email kamu.";
              }

              return {
                response_code: 202,
                messages: {
                  info: messages,
                },
              };
            }
          }
        } else {
          if (type == "CECK_PIN") {
            if (body_.pin == undefined) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, param pin is required',
              );
            } else {
              if (body_.pin.length != 6) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed, pin lenght must 6 digit',
                );
              }
            }

            if (datauserbasicsService.pin != undefined) {
              var current_pin = datauserbasicsService.pin;
              var decript_pin = await this.utilsService.decrypt(current_pin.toString());
              if (decript_pin == body_.pin) {
                return {
                  response_code: 202,
                  messages: {
                    info: ['Ceck Pin Succcesfully'],
                  },
                };
              } else {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed, pin not match current pin',
                );
              }

              //Create ActivityEvent Parent
              try {
                var id_parent = new mongoose.Types.ObjectId();
                data_CreateActivityeventsDto_parent._id = id_parent;
                data_CreateActivityeventsDto_parent.activityEventID =
                  ID_parent_ActivityEvent;
                data_CreateActivityeventsDto_parent.activityType = type;
                data_CreateActivityeventsDto_parent.active = true;
                data_CreateActivityeventsDto_parent.status = 'INITIAL';
                data_CreateActivityeventsDto_parent.target = 'COMPLETE';
                data_CreateActivityeventsDto_parent.event = type;
                data_CreateActivityeventsDto_parent._class =
                  'io.melody.hyppe.trans.domain.ActivityEvent';
                data_CreateActivityeventsDto_parent.payload = {
                  login_location: {
                    latitude: undefined,
                    longitude: undefined,
                  },
                  logout_date: undefined,
                  login_date: undefined,
                  login_device: undefined,
                  email: user_email,
                };
                data_CreateActivityeventsDto_parent.createdAt = current_date_string;
                data_CreateActivityeventsDto_parent.updatedAt = current_date_string;
                data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
                data_CreateActivityeventsDto_parent.__v = undefined;
                data_CreateActivityeventsDto_parent.flowIsDone = true;
                data_CreateActivityeventsDto_parent.transitions = [
                  {
                    $ref: 'activityevents',
                    $id: Object(ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  },
                ];
                data_CreateActivityeventsDto_parent.userbasic =
                  datauserbasicsService._id;

                //Insert ActivityEvent Parent
                await this.activityeventsService.create(
                  data_CreateActivityeventsDto_parent,
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Activity events Parent. Error: ' +
                  error,
                );
              }

              //Create ActivityEvent child
              try {
                var id_child = new mongoose.Types.ObjectId();
                data_CreateActivityeventsDto_child._id = id_child;
                data_CreateActivityeventsDto_child.activityEventID =
                  ID_child_ActivityEvent;
                data_CreateActivityeventsDto_child.activityType = type;
                data_CreateActivityeventsDto_child.active = true;
                data_CreateActivityeventsDto_child.status = 'COMPLETE';
                data_CreateActivityeventsDto_child.target = 'COMPLETE';
                data_CreateActivityeventsDto_child.event = type;
                data_CreateActivityeventsDto_child._class =
                  'io.melody.hyppe.trans.domain.ActivityEvent';
                data_CreateActivityeventsDto_child.payload = {
                  login_location: {
                    latitude: undefined,
                    longitude: undefined,
                  },
                  logout_date: undefined,
                  login_date: undefined,
                  login_device: undefined,
                  email: user_email,
                };
                data_CreateActivityeventsDto_child.createdAt = current_date_string;
                data_CreateActivityeventsDto_child.updatedAt = current_date_string;
                data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
                data_CreateActivityeventsDto_child.flowIsDone = true;
                data_CreateActivityeventsDto_child.__v = undefined;
                data_CreateActivityeventsDto_child.parentActivityEventID =
                  ID_parent_ActivityEvent;
                data_CreateActivityeventsDto_child.userbasic =
                  datauserbasicsService._id;

                //Insert ActivityEvent Parent
                await this.activityeventsService.create(
                  data_CreateActivityeventsDto_child,
                );
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Activity events Child. Error: ' +
                  error,
                );
              }
            } else {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, you must create pin first',
              );
            }
          } else if (type == "FORGOT_PIN") {
            //Create ActivityEvent Parent
            try {
              var id_parent = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_parent._id = id_parent;
              data_CreateActivityeventsDto_parent.activityEventID =
                ID_parent_ActivityEvent;
              data_CreateActivityeventsDto_parent.activityType = type;
              data_CreateActivityeventsDto_parent.active = true;
              data_CreateActivityeventsDto_parent.status = 'INITIAL';
              data_CreateActivityeventsDto_parent.target = 'NOTIFY';
              data_CreateActivityeventsDto_parent.event = type;
              data_CreateActivityeventsDto_parent.fork = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_parent.action = 'RecoverPinCommand';
              data_CreateActivityeventsDto_parent._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_parent.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_parent.createdAt = current_date_string;
              data_CreateActivityeventsDto_parent.updatedAt = current_date_string;
              data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
              data_CreateActivityeventsDto_parent.__v = undefined;
              data_CreateActivityeventsDto_parent.flowIsDone = false;
              data_CreateActivityeventsDto_parent.transitions = [
                {
                  $ref: 'activityevents',
                  $id: Object(ID_child_ActivityEvent),
                  $db: 'hyppe_trans_db',
                },
              ];
              data_CreateActivityeventsDto_parent.userbasic =
                datauserbasicsService._id;

              //Insert ActivityEvent Parent
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_parent,
              );
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Parent. Error: ' +
                error,
              );
            }

            //Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType = type;
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'NOTIFY';
              data_CreateActivityeventsDto_child.target = 'REPLY';
              data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date_string;
              data_CreateActivityeventsDto_child.updatedAt = current_date_string;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_child.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                ID_parent_ActivityEvent;
              data_CreateActivityeventsDto_child.userbasic =
                datauserbasicsService._id;

              //Insert ActivityEvent Parent
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_child,
              );
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error: ' +
                error,
              );
            }

            //Generate OTP
            try {
              var OTP = await this.utilsService.generateOTP();
              var OTP_request_time = current_date.getTime();
              var OTP_expired_time = (current_date.setMinutes(current_date.getMinutes() + Number(setting_ExpiredTimeOTPPin)));

              var createUserbasicDto_ = new CreateUserbasicDto();
              createUserbasicDto_.otp_pin = OTP;
              createUserbasicDto_.otp_attemp = 0;
              createUserbasicDto_.otppinVerified = false;
              createUserbasicDto_.otp_request_time = Long.fromString(OTP_request_time.toString());
              createUserbasicDto_.otp_expired_time = Long.fromString(OTP_expired_time.toString());
              await this.userbasicsService.updateData(user_email, createUserbasicDto_);

              await this.authService.sendemailOTP(
                user_userAuth.email.toString(),
                OTP.toString(),
                'RECOVER_PASS',
              );

              return {
                response_code: 202,
                messages: {
                  info: ['Request forgot PIN request successful'],
                },
              };
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Gnerate OTP. Error: ' + error,
              );
            }
          } else {
            if (body_.pin == undefined) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, param pin is required',
              );
            } else {
              if (body_.pin.length != 6) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed, pin lenght must 6 digit',
                );
              }
            }

            //Create ActivityEvent Parent
            try {
              var id_parent = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_parent._id = id_parent;
              data_CreateActivityeventsDto_parent.activityEventID =
                ID_parent_ActivityEvent;
              data_CreateActivityeventsDto_parent.activityType = type;
              data_CreateActivityeventsDto_parent.active = true;
              data_CreateActivityeventsDto_parent.status = 'INITIAL';
              data_CreateActivityeventsDto_parent.target = 'NOTIFY';
              data_CreateActivityeventsDto_parent.event = type;
              data_CreateActivityeventsDto_parent.fork = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_parent.action = 'RecoverPassCommand';
              data_CreateActivityeventsDto_parent._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_parent.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_parent.createdAt = current_date_string;
              data_CreateActivityeventsDto_parent.updatedAt = current_date_string;
              data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
              data_CreateActivityeventsDto_parent.__v = undefined;
              data_CreateActivityeventsDto_parent.flowIsDone = false;
              data_CreateActivityeventsDto_parent.transitions = [
                {
                  $ref: 'activityevents',
                  $id: Object(ID_child_ActivityEvent),
                  $db: 'hyppe_trans_db',
                },
              ];
              data_CreateActivityeventsDto_parent.userbasic =
                datauserbasicsService._id;

              //Insert ActivityEvent Parent
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_parent,
              );
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Parent. Error: ' +
                error,
              );
            }

            //Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType = type;
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'NOTIFY';
              data_CreateActivityeventsDto_child.target = 'REPLY';
              data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date_string;
              data_CreateActivityeventsDto_child.updatedAt = current_date_string;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_child.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                ID_parent_ActivityEvent;
              data_CreateActivityeventsDto_child.userbasic =
                datauserbasicsService._id;

              //Insert ActivityEvent Parent
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_child,
              );
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error: ' +
                error,
              );
            }

            //Generate OTP
            try {
              var encrypt_pin = await this.utilsService.encrypt(body_.pin.toString());
              var OTP = await this.utilsService.generateOTP();
              var OTP_request_time = current_date.getTime();
              var OTP_expired_time = (current_date.setMinutes(current_date.getMinutes() + Number(setting_ExpiredTimeOTPPin)));

              var createUserbasicDto_ = new CreateUserbasicDto();
              createUserbasicDto_.pin = encrypt_pin;
              createUserbasicDto_.otp_pin = OTP;
              createUserbasicDto_.otp_attemp = 0;
              createUserbasicDto_.otppinVerified = false;
              createUserbasicDto_.otp_request_time = Long.fromString(OTP_request_time.toString());
              createUserbasicDto_.otp_expired_time = Long.fromString(OTP_expired_time.toString());
              await this.userbasicsService.updateData(user_email, createUserbasicDto_);

              await this.authService.sendemailOTP(
                user_userAuth.email.toString(),
                OTP.toString(),
                'RECOVER_PASS',
              );

              return {
                response_code: 202,
                messages: {
                  info: ['Request create PIN request successful'],
                },
              };
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Gnerate OTP. Error: ' + error,
              );
            }
          }
        }
      } else {
        var messages = "";
        if (lang == "en") {
          messages = "No users were found. Please check again.";
        } else {
          messages = "Tidak ada pengguna yang ditemukan. Silahkan cek kembali.";
        }
        await this.errorHandler.generateNotAcceptableException(
          messages,
        );
      }
    } else {
      var messages = "";
      if (lang == "en") {
        messages = "No users were found. Please check again.";
      } else {
        messages = "Tidak ada pengguna yang ditemukan. Silahkan cek kembali.";
      }
      await this.errorHandler.generateNotAcceptableException(
        messages,
      );
    }

    // var setting_ExpiredTimeOTPPin = await this.utilsService.getSetting("ExpiredTimeOTPPin");
    // var user_email_header = null;
    // if (headers['x-auth-user'] == undefined) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }else{
    //   user_email_header = headers['x-auth-user'];
    // }
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, token email not match',
    //   );
    // }

    // if (body_.event != undefined){
    //   var event = body_.event;
    //   const user_userAuth = await this.userauthsService.findOne(
    //     user_email_header,
    //   );
    //   const user_userbasics = await this.userbasicsService.findOne(
    //     user_email_header,
    //   );
    //   if ((await this.utilsService.ceckData(user_userAuth)) && (await this.utilsService.ceckData(user_userbasics))){
    //     if (event == "REQUEST") {
    //       if (body_.pin != undefined) {
    //         var pin = body_.pin;
    //         try {
    //           var encrypt_pin = await this.utilsService.encrypt(pin.toString());
    //           var curent_date = new Date();
    //           var OTP = await this.utilsService.generateOTP();
    //           var otp_request_time = curent_date.getTime();
    //           var otp_expired_time = (curent_date.setMinutes(curent_date.getMinutes() + Number(setting_ExpiredTimeOTPPin)));

    //           var createUserbasicDto_ = new CreateUserbasicDto();
    //           createUserbasicDto_.pin = encrypt_pin;
    //           createUserbasicDto_.otp_pin = OTP;
    //           createUserbasicDto_.otp_request_time = Long.fromString(otp_request_time.toString());
    //           createUserbasicDto_.otp_expired_time = Long.fromString(otp_expired_time.toString());
    //           await this.userbasicsService.updateData(user_userbasics.email.toString(), createUserbasicDto_);

    //           await this.authService.sendemailOTP(
    //             user_userAuth.email.toString(),
    //             OTP.toString(),
    //             'RECOVER_PASS',
    //           );
    //           return {
    //             response_code: 202,
    //             messages: {
    //               info: ['OTP request has been sent'],
    //             },
    //           };
    //         } catch (e) {
    //           await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed, Error ' + e,
    //           );
    //         }
    //       } else {
    //         await this.errorHandler.generateNotAcceptableException(
    //           'Unabled to proceed, param pin is required',
    //         );
    //       }
    //     } else if (event == "VERIFY_OTP") {
    //       if (body_.otp != undefined) {
    //         var otp = body_.otp;
    //         if (user_userbasics.otp_pin!=undefined){
    //           var curent_date.get
    //           if(){

    //           }
    //           if (otp == user_userbasics.otp_pin) {
    //             var createUserbasicDto_ = new CreateUserbasicDto();
    //             createUserbasicDto_.otp_pin = null;
    //             await this.userbasicsService.updateData(user_userbasics.email.toString(), createUserbasicDto_);

    //             return {
    //               response_code: 202,
    //               messages: {
    //                 info: ['PIN has been created'],
    //               },
    //             };
    //           } else {
    //             try {
    //               var OTP = await this.utilsService.generateOTP();

    //               var createUserbasicDto_ = new CreateUserbasicDto();
    //               createUserbasicDto_.otp_pin = OTP;
    //               await this.userbasicsService.updateData(user_userbasics.email.toString(), createUserbasicDto_);

    //               await this.authService.sendemailOTP(
    //                 user_userAuth.email.toString(),
    //                 OTP.toString(),
    //                 'RECOVER_PASS',
    //               );
    //               await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed, otp not match OTP request has been sent',
    //               );
    //             } catch (e) {
    //               await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed, Error ' + e,
    //               );
    //             }
    //           }
    //         } else {
    //           await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed',
    //           );
    //         }
    //       } else {
    //         await this.errorHandler.generateNotAcceptableException(
    //           'Unabled to proceed, otp pin is required',
    //         );
    //       }
    //     } else if (event == "RESEND") {
    //       await this.authService.sendemailOTP(
    //         user_userAuth.email.toString(),
    //         user_userbasics.otp_pin.toString(),
    //         'RECOVER_PASS',
    //       );
    //       return {
    //         response_code: 202,
    //         messages: {
    //           info: ['OTP request has been sent'],
    //         },
    //       };
    //     }
    //   }else{
    //     await this.errorHandler.generateNotAcceptableException(
    //       'Unabled to proceed, user not found',
    //     );
    //   }
    // } else {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, param event is required',
    //   );
    // }
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/user/kyc/stat')
  async kycUpdateStatus(
    @Query('status') status: string,
    @Query('email') email: string): Promise<Object> {
    if (email == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param email required',
      );
    }
    let isIdVerified = false;
    if (status == "unverified") {
      isIdVerified = false;
    } else if (status == "verified") {
      isIdVerified = true;
    } else if (status == "review") {
      isIdVerified = false;
    }
    return this.userbasicsService.updateStatusKyc(email, isIdVerified, status);
  }

  // @HttpCode(HttpStatus.ACCEPTED)
  // @Get('api/user/getpin?')
  // async getPin(@Query('email') email: string) {
  //   return await this.utilsService.getPin(email);
  // }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('api/user/acces/:id')
  async getAcces(@Param('id') id: string) {
    var acces = await this.groupService.getAcces(new mongoose.Types.ObjectId(id.toString()));
    return {
      response_code: 202,
      data: acces,
      messages: {
        info: ['Get Acces successfully'],
      },
    };
  }

  @Get('api/user/userdetail/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard)
  async userdetail(@Param('id') id: string): Promise<any> {

    var datauserdetail = null;
    var data = [];
    var dokumen = [];
    var filesupport = null;
    var lengsupport = null;
    var arrsuport = [];
    var newsupport = null;
    var mediaId = null;
    var fileselfiepict = null;
    var fileproofpict = null;
    var bankacount = [];
    var datafrend = null;
    var lengfrend = null;
    var email = null;
    var emailfrend = null;
    var tempatLahir = null;

    try {
      datauserdetail = await this.userbasicsService.getUserDetails(id);

    } catch (e) {
      datauserdetail = null;
    }



    if (datauserdetail !== null) {
      email = datauserdetail[0].email;

      try {

        mediaId = datauserdetail[0].mediaId;
      } catch (e) {
        mediaId = "";
      }

      try {

        tempatLahir = datauserdetail[0].tempatLahir
      } catch (e) {
        tempatLahir = "";
      }

      try {
        fileselfiepict = "/" + datauserdetail[0].dokument[0].mediaSelfiepicts.mediaEndpoint;

        if (datauserdetail[0].dokument[0].mediaSelfiepicts.mediaEndpoint != null) {
          arrsuport.push(fileproofpict);
        }

      } catch (e) {
        fileselfiepict = "";

      }
      try {

        fileproofpict = "/" + datauserdetail[0].dokument[0].mediaproofpicts.mediaEndpoint;

        if (datauserdetail[0].dokument[0].mediaproofpicts.mediaEndpoint != null) {
          arrsuport.push(fileproofpict);
        }

      } catch (e) {
        fileproofpict = "";

      }
      try {

        filesupport = datauserdetail[0].dokument[0].mediaSupportfile.mediaEndpoint;
        lengsupport = filesupport.length;
      } catch (e) {
        filesupport = [];
        lengsupport = 0;
      }


      if (lengsupport > 0) {
        for (let i = 0; i < lengsupport; i++) {

          newsupport = "/supportfile/" + mediaId + "/" + i;
          arrsuport.push(newsupport);

        }
      }

      try {
        bankacount = datauserdetail[0].userbankaccounts;
      } catch (e) {
        bankacount = [];
      }

      if (bankacount[0]._id === undefined) {
        bankacount = [];
      } else {
        bankacount = bankacount;
      }

      try {
        //versi lama
        // datafrend = await this.contenteventsService.findfriend(email);
        // console.log(datafrend);
        // lengfrend = datafrend.length;
        // for (var i = 0; i < lengfrend; i++) {
        //   emailfrend = datafrend[i]._id.email;

        //   if (email === emailfrend) {
        //     lengfrend = lengfrend - 1;
        //   }
        // }

        //versi baru
        const mongoose = require('mongoose');
        let getid = mongoose.Types.ObjectId(id);
        datafrend = await this.friendListService.findOne(getid);
        lengfrend = datafrend.totalfriend;
        datafrend = datafrend.friendlist;
        // console.log(lengfrend);
      } catch (e) {
        datafrend = null;
      }

      let obj = {

        "_id": datauserdetail[0]._id,
        "fullName": datauserdetail[0].fullName,
        "username": datauserdetail[0].username,
        "email": datauserdetail[0].email,
        "createdAt": datauserdetail[0].createdAt,
        "status": datauserdetail[0].status,
        "dob": datauserdetail[0].dob,
        "gender": datauserdetail[0].gender,
        "insights": datauserdetail[0].insights,
        "states": datauserdetail[0].states,
        "cities": datauserdetail[0].cities,
        "countries": datauserdetail[0].countries,
        "interests": datauserdetail[0].interests,
        "dokument": arrsuport,
        "avatar": datauserdetail[0].avatar,
        "mobileNumber": datauserdetail[0].mobileNumber,
        "tempatLahir": tempatLahir,
        "statusUser": datauserdetail[0].statusUser,
        "friend": lengfrend,
        "userbankaccounts": bankacount,
      };

      data.push(obj);
    } else {
      data = [];
    }

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/profilepicture')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'profilePict', maxCount: 1 }, { name: 'proofPict', maxCount: 1, }]))
  async uploadProfile_v2(
    @UploadedFiles() files: {
      profilePict?: Express.Multer.File[],
      proofPict?: Express.Multer.File[]
    },
    @Body() request,
    @Headers() headers) {

    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed token and email not match',
      );
    }

    if (headers['x-auth-token'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed header email is required',
      );
    }

    if (request.email == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param mail is required',
      );
    }

    //Get User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      headers['x-auth-user'],
    );

    var re = /(?:\.([^.]+))?$/;

    var current_date = await this.utilsService.getDateTimeString();
    var id_mediaprofilepicts = await this.utilsService.generateId();
    var createMediaproofpictsDto = new CreateMediaprofilepictsDto();
    //Ceck User Userbasics
    if (await this.utilsService.ceckData(datauserbasicsService)) {
      if (files.profilePict != undefined) {

        var originalName = files.profilePict[0].originalname;
        //var extension = originalName.substring(originalName.lastIndexOf('.'), originalName.length);
        // var textSplit = originalName.split('.');
        // var extension = '.jpg';
        // if (textSplit.length == 2) {
        //   extension = textSplit[1];
        // } else {
        //   extension = textSplit[textSplit.length - 1];
        // }
        var extension = '.jpeg';
        var userId = datauserbasicsService._id.toString();
        var fileName = userId + extension;
        var mimetype = files.profilePict[0].mimetype;

        var image_information = await sharp(files.profilePict[0].buffer).metadata();
        console.log("IMAGE INFORMATION", image_information);
        var image_format = image_information.format;
        var image_height = image_information.height;
        var image_width = image_information.width;
        var image_orientation = image_information.orientation;

        //Get Image Mode
        var image_mode = await this.utilsService.getImageMode(image_width, image_height);
        console.log("IMAGE MODE", image_mode);

        //Get Ceck Mode
        var New_height = 0;
        var New_width = 0;

        if (image_mode == "LANDSCAPE") {
          New_height = image_height;
          New_width = image_width;
        } else if (image_mode == "POTRET") {
          New_height = image_height;
          New_width = image_width;
        }

        var file_convert = null;
        if (image_format == "heif") {
          const outputBuffer = await convert({
            buffer: files.profilePict[0].buffer,
            format: 'JPEG',
            quality: 1
          });
          console.log("outputBuffer", await sharp(outputBuffer).metadata());
          file_convert = await sharp(outputBuffer).resize(Math.round(New_width), Math.round(New_height)).toBuffer();
        } else {
          file_convert = await sharp(files.profilePict[0].buffer, { failOnError: false }).resize(Math.round(New_width), Math.round(New_height)).withMetadata({ image_orientation }).toBuffer();
        }

        var image_information2 = await sharp(file_convert).metadata();
        console.log("image_information2", image_information2);

        var image_orientation2 = image_information2.orientation;
        console.log("image_orientation2", image_orientation2);


        var thumnail = null;
        var ori = null;
        try {
          if (image_orientation2 == 1) {
            thumnail = await sharp(file_convert).resize(100, 100).toBuffer();
            ori = await sharp(file_convert).resize(Math.round(New_width), Math.round(New_height)).toBuffer();
          } else if (image_orientation2 == 6) {
            thumnail = await sharp(file_convert).rotate(90).resize(100, 100).toBuffer();
            ori = await sharp(file_convert).rotate(90).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
          } else if (image_orientation2 == 8) {
            thumnail = await sharp(file_convert).rotate(270).resize(100, 100).toBuffer();
            ori = await sharp(file_convert).rotate(270).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
          } else {
            thumnail = await sharp(file_convert).resize(100, 100).toBuffer();
            ori = file_convert;
          }
          console.log(typeof thumnail);
        } catch (e) {
          console.log("THUMNAIL", "FAILED TO CREATE THUMNAIL");
        }

        var result = await this.ossService.uploadFileBuffer(Buffer.from(ori), userId + "/profilePict/" + fileName);
        var result_thum = await this.ossService.uploadFileBuffer(Buffer.from(thumnail), userId + "/profilePict/" + userId + "_thum" + extension);
        console.log("THUMNAIL_UPLOAD", result_thum);
        if (result != undefined) {
          if (result.res != undefined) {
            if (result.res.statusCode != undefined) {
              if (result.res.statusCode == 200) {
                try {
                  if (datauserbasicsService.profilePict != undefined) {
                    var profilePict_json = JSON.parse(JSON.stringify(datauserbasicsService.profilePict));
                    var data_mediaprofpicts = await this.mediaprofilepictsService.findOne(profilePict_json.$id);
                    if (await this.utilsService.ceckData(data_mediaprofpicts)) {
                      id_mediaprofilepicts = data_mediaprofpicts._id.toString();

                      createMediaproofpictsDto.mediaID = id_mediaprofilepicts;
                      createMediaproofpictsDto.mediaBasePath = userId + "/profilePict/" + fileName;
                      createMediaproofpictsDto.mediaUri = fileName;
                      createMediaproofpictsDto.originalName = originalName;

                      createMediaproofpictsDto.fsSourceUri = result.res.requestUrls[0];
                      createMediaproofpictsDto.fsSourceName = fileName;
                      createMediaproofpictsDto.fsTargetUri = result.res.requestUrls[0];
                      createMediaproofpictsDto.uploadSource = "OSS";

                      createMediaproofpictsDto.mediaThumBasePath = userId + "/profilePict/" + userId + "_thum" + extension;
                      createMediaproofpictsDto.mediaThumName = userId + "_thum" + extension;
                      createMediaproofpictsDto.mediaThumUri = result_thum.res.requestUrls[0];
                      createMediaproofpictsDto._class = "io.melody.hyppe.content.domain.MediaProfilePict";
                      await this.mediaprofilepictsService.updatebyId(id_mediaprofilepicts, createMediaproofpictsDto);
                    } else {
                      createMediaproofpictsDto._id = id_mediaprofilepicts;
                      createMediaproofpictsDto.mediaID = id_mediaprofilepicts;
                      createMediaproofpictsDto.active = true;
                      createMediaproofpictsDto.createdAt = current_date;
                      createMediaproofpictsDto.updatedAt = current_date;
                      createMediaproofpictsDto.postType = 'profilepict';
                      createMediaproofpictsDto.mediaType = 'image';

                      createMediaproofpictsDto.mediaBasePath = userId + "/profilePict/" + fileName;
                      createMediaproofpictsDto.mediaUri = fileName;
                      createMediaproofpictsDto.originalName = originalName;

                      createMediaproofpictsDto.fsSourceUri = result.res.requestUrls[0];
                      createMediaproofpictsDto.fsSourceName = fileName;
                      createMediaproofpictsDto.fsTargetUri = result.res.requestUrls[0];

                      createMediaproofpictsDto.mediaThumBasePath = userId + "/profilePict/" + userId + "_thum" + extension;
                      createMediaproofpictsDto.mediaThumName = userId + "_thum" + extension;
                      createMediaproofpictsDto.mediaMime = mimetype;
                      createMediaproofpictsDto.uploadSource = "OSS";
                      createMediaproofpictsDto._class = "io.melody.hyppe.content.domain.MediaProfilePict";
                      await this.mediaprofilepictsService.create(createMediaproofpictsDto);
                    }
                  } else {
                    createMediaproofpictsDto._id = id_mediaprofilepicts;
                    createMediaproofpictsDto.mediaID = id_mediaprofilepicts;
                    createMediaproofpictsDto.active = true;
                    createMediaproofpictsDto.createdAt = current_date;
                    createMediaproofpictsDto.updatedAt = current_date;
                    createMediaproofpictsDto.postType = 'profilepict';
                    createMediaproofpictsDto.mediaType = 'image';

                    createMediaproofpictsDto.mediaBasePath = userId + "/profilePict/" + fileName;
                    createMediaproofpictsDto.mediaUri = fileName;
                    createMediaproofpictsDto.originalName = originalName;

                    createMediaproofpictsDto.fsSourceUri = result.res.requestUrls[0];
                    createMediaproofpictsDto.fsSourceName = fileName;
                    createMediaproofpictsDto.fsTargetUri = result.res.requestUrls[0];

                    createMediaproofpictsDto.mediaThumBasePath = userId + "/profilePict/" + userId + "_thum" + extension;
                    createMediaproofpictsDto.mediaThumName = userId + "_thum" + extension;
                    createMediaproofpictsDto.mediaMime = mimetype;
                    createMediaproofpictsDto.uploadSource = "OSS";
                    createMediaproofpictsDto._class = "io.melody.hyppe.content.domain.MediaProfilePict";
                    await this.mediaprofilepictsService.create(createMediaproofpictsDto);
                  }

                  var json_mediaprofilepicts = { "$ref": "mediaprofilepicts", "$id": id_mediaprofilepicts, "$db": "hyppe_content_db" };
                  datauserbasicsService.profilePict = json_mediaprofilepicts;
                  await this.userbasicsService.updatebyEmailV2(request.email, datauserbasicsService);

                  return {
                    "response_code": 202,
                    "messages": {
                      "info": [
                        "Update Profile Successful"
                      ]
                    }
                  };
                } catch (e) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed update profile picture ' + e,
                  );
                }
              } else {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed update profile picture ',
                );
              }
            } else {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile picture ',
              );
            }
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed update profile picture ',
            );
          }
        } else {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed update profile picture ',
          );
        }
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed cardPict is required',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/v2/profilepicture')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'profilePict', maxCount: 1 }, { name: 'proofPict', maxCount: 1, }]))
  async uploadProfile(
    @UploadedFiles() files: {
      profilePict?: Express.Multer.File[],
      proofPict?: Express.Multer.File[]
    },
    @Body() request,
    @Headers() headers) {

    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed token and email not match',
      );
    }

    if (headers['x-auth-token'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed header email is required',
      );
    }

    if (request.email == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param mail is required',
      );
    }

    //Get User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      headers['x-auth-user'],
    );

    var re = /(?:\.([^.]+))?$/;

    var current_date = await this.utilsService.getDateTimeString();
    var id_mediaprofilepicts = await this.utilsService.generateId();
    var createMediaproofpictsDto = new CreateMediaprofilepictsDto();
    //Ceck User Userbasics
    if (await this.utilsService.ceckData(datauserbasicsService)) {
      if (files.profilePict != undefined) {

        var originalName = files.profilePict[0].originalname;
        //var extension = originalName.substring(originalName.lastIndexOf('.'), originalName.length);
        // var textSplit = originalName.split('.');
        // var extension = '.jpg';
        // if (textSplit.length == 2) {
        //   extension = textSplit[1];
        // } else {
        //   extension = textSplit[textSplit.length - 1];
        // }
        var extension = '.jpeg';
        var userId = datauserbasicsService._id.toString();
        var fileName = userId + extension;
        var mimetype = files.profilePict[0].mimetype;

        var thumnail = null;
        try {
          thumnail = await sharp(files.profilePict[0].buffer).resize(100, 100).toBuffer();
          console.log(typeof thumnail);
        } catch (e) {
          console.log("THUMNAIL", "FAILED TO CREATE THUMNAIL");
        }

        var result = await this.ossService.uploadFile(files.profilePict[0], userId + "/profilePict/" + fileName);
        var result_thum = await this.ossService.uploadFileBuffer(Buffer.from(thumnail), userId + "/profilePict/" + userId + "_thum" + extension);
        console.log("THUMNAIL_UPLOAD", result_thum);
        if (result != undefined) {
          if (result.res != undefined) {
            if (result.res.statusCode != undefined) {
              if (result.res.statusCode == 200) {
                try {
                  if (datauserbasicsService.profilePict != undefined) {
                    var profilePict_json = JSON.parse(JSON.stringify(datauserbasicsService.profilePict));
                    var data_mediaprofpicts = await this.mediaprofilepictsService.findOne(profilePict_json.$id);
                    if (await this.utilsService.ceckData(data_mediaprofpicts)) {
                      id_mediaprofilepicts = data_mediaprofpicts._id.toString();

                      createMediaproofpictsDto.mediaID = id_mediaprofilepicts;
                      createMediaproofpictsDto.mediaBasePath = userId + "/profilePict/" + fileName;
                      createMediaproofpictsDto.mediaUri = fileName;
                      createMediaproofpictsDto.originalName = originalName;

                      createMediaproofpictsDto.fsSourceUri = result.res.requestUrls[0];
                      createMediaproofpictsDto.fsSourceName = fileName;
                      createMediaproofpictsDto.fsTargetUri = result.res.requestUrls[0];
                      createMediaproofpictsDto.uploadSource = "OSS";

                      createMediaproofpictsDto.mediaThumBasePath = userId + "/profilePict/" + userId + "_thum" + extension;
                      createMediaproofpictsDto.mediaThumName = userId + "_thum" + extension;
                      createMediaproofpictsDto.mediaThumUri = result_thum.res.requestUrls[0];
                      createMediaproofpictsDto._class = "io.melody.hyppe.content.domain.MediaProfilePict";
                      await this.mediaprofilepictsService.updatebyId(id_mediaprofilepicts, createMediaproofpictsDto);
                    } else {
                      createMediaproofpictsDto._id = id_mediaprofilepicts;
                      createMediaproofpictsDto.mediaID = id_mediaprofilepicts;
                      createMediaproofpictsDto.active = true;
                      createMediaproofpictsDto.createdAt = current_date;
                      createMediaproofpictsDto.updatedAt = current_date;
                      createMediaproofpictsDto.postType = 'profilepict';
                      createMediaproofpictsDto.mediaType = 'image';

                      createMediaproofpictsDto.mediaBasePath = userId + "/profilepict/" + fileName;
                      createMediaproofpictsDto.mediaUri = fileName;
                      createMediaproofpictsDto.originalName = originalName;

                      createMediaproofpictsDto.fsSourceUri = result.res.requestUrls[0];
                      createMediaproofpictsDto.fsSourceName = fileName;
                      createMediaproofpictsDto.fsTargetUri = result.res.requestUrls[0];

                      createMediaproofpictsDto.mediaThumBasePath = userId + "/profilePict/" + userId + "_thum" + extension;
                      createMediaproofpictsDto.mediaThumName = userId + "_thum" + extension;
                      createMediaproofpictsDto.mediaMime = mimetype;
                      createMediaproofpictsDto.uploadSource = "OSS";
                      createMediaproofpictsDto._class = "io.melody.hyppe.content.domain.MediaProfilePict";
                      await this.mediaprofilepictsService.create(createMediaproofpictsDto);
                    }
                  } else {
                    createMediaproofpictsDto._id = id_mediaprofilepicts;
                    createMediaproofpictsDto.mediaID = id_mediaprofilepicts;
                    createMediaproofpictsDto.active = true;
                    createMediaproofpictsDto.createdAt = current_date;
                    createMediaproofpictsDto.updatedAt = current_date;
                    createMediaproofpictsDto.postType = 'profilepict';
                    createMediaproofpictsDto.mediaType = 'image';

                    createMediaproofpictsDto.mediaBasePath = userId + "/profilepict/" + fileName;
                    createMediaproofpictsDto.mediaUri = fileName;
                    createMediaproofpictsDto.originalName = originalName;

                    createMediaproofpictsDto.fsSourceUri = result.res.requestUrls[0];
                    createMediaproofpictsDto.fsSourceName = fileName;
                    createMediaproofpictsDto.fsTargetUri = result.res.requestUrls[0];

                    createMediaproofpictsDto.mediaThumBasePath = userId + "/profilePict/" + userId + "_thum" + extension;
                    createMediaproofpictsDto.mediaThumName = userId + "_thum" + extension;
                    createMediaproofpictsDto.mediaMime = mimetype;
                    createMediaproofpictsDto.uploadSource = "OSS";
                    createMediaproofpictsDto._class = "io.melody.hyppe.content.domain.MediaProfilePict";
                    await this.mediaprofilepictsService.create(createMediaproofpictsDto);
                  }

                  var json_mediaprofilepicts = { "$ref": "mediaprofilepicts", "$id": id_mediaprofilepicts, "$db": "hyppe_content_db" };
                  datauserbasicsService.profilePict = json_mediaprofilepicts;
                  await this.userbasicsService.updatebyEmailV2(request.email, datauserbasicsService);

                  return {
                    "response_code": 202,
                    "messages": {
                      "info": [
                        "Update Profile Successful"
                      ]
                    }
                  };
                } catch (e) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed update profile picture ' + e,
                  );
                }
              } else {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed update profile picture ',
                );
              }
            } else {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile picture ',
              );
            }
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed update profile picture ',
            );
          }
        } else {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed update profile picture ',
          );
        }
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed cardPict is required',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
  }

  @Post('api/user/run')
  async run() {
    var getList = await this.interestsRepoService.findData();
    console.log(getList.length);
    for (var i = 0; i < getList.length; i++) {
      if (getList[i]._id != undefined) {
        var _idExixting = getList[i]._id.toString();
        console.log(_idExixting);

        for (var i = 0; i < getList[0].basics_data.length; i++) {
          if (_idExixting == "61bad280f1f8fe214378949c") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c38c');
          } else if (_idExixting == "61bad280f1f8fe214378949d") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c38d');
          } else if (_idExixting == "61bad280f1f8fe214378949e") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c38e');
          } else if (_idExixting == "61bad280f1f8fe214378949f") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c38f');
          } else if (_idExixting == "61bad280f1f8fe21437894a0") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c390');
          } else if (_idExixting == "61bad280f1f8fe21437894a1") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c391');
          } else if (_idExixting == "61bad280f1f8fe21437894a2") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c392');
          } else if (_idExixting == "61bad280f1f8fe21437894a3") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c393');
          } else if (_idExixting == "61bad280f1f8fe21437894a4") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c394');
          } else if (_idExixting == "61bad280f1f8fe21437894a5") {
            await this.userbasicsService.executeData(_idExixting, '613bc4getda9ec319617aa6c395');
          } else if (_idExixting == "61bad280f1f8fe21437894a6") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c396');
          } else if (_idExixting == "61bad280f1f8fe21437894a7") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c397');
          } else if (_idExixting == "61bad280f1f8fe21437894a8") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c398');
          } else if (_idExixting == "61bad281f1f8fe21437894a9") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c399');
          } else if (_idExixting == "61bad281f1f8fe21437894aa") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c39a');
          } else if (_idExixting == "61bad281f1f8fe21437894ab") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c39b');
          } else if (_idExixting == "61bad281f1f8fe21437894ac") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c400');
          } else if (_idExixting == "61bad281f1f8fe21437894ad") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c40a');
          } else if (_idExixting == "61bad281f1f8fe21437894ae") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c40b');
          } else if (_idExixting == "61bad281f1f8fe21437894af") {
            await this.userbasicsService.executeData(_idExixting, '613bc4da9ec319617aa6c40c');
          }
        }
      } else {
        console.log(getList[i]);
      }
    }
    return getList;
  }

  @Post('api/user/bearer')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard)
  async bearer(@Headers() headers) {
    return {
      "response_code": 202,
      "messages": {
        "info": [
          "The process successful"
        ]
      }
    };
  }


}