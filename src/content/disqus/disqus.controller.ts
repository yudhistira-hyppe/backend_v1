import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, BadRequestException, Res, HttpStatus, Query, Request, Req, HttpCode } from '@nestjs/common';
import { DisqusService } from './disqus.service';
import { CreateDisqusDto, ContentDto, DisqusDto, DisqusResDto, DisqusResponseApps, Messages, DisqusResponseComment, DisqusComment } from './dto/create-disqus.dto';
import { Disqus } from './schemas/disqus.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FormDataRequest } from 'nestjs-form-data';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { DisquscontactsService } from '../disquscontacts/disquscontacts.service';
import { request } from 'https';
import { CreateDisquslogsDto, DisquslogsDto } from '../disquslogs/dto/create-disquslogs.dto';
import { PostDisqusService } from './post/postdisqus.service';
import { ReactionsService } from '../../infra/reactions/reactions.service';
import { CreateDisquscontactsDto } from '../disquscontacts/dto/create-disquscontacts.dto';
// import { CreateInsightsDto, InsightsDto } from '../insights/dto/create-insights.dto';
import { ProfileDTO } from '../../utils/data/Profile'
import { InsightsService } from '../../content/insights/insights.service';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { ContentEventId, CreateContenteventsDto } from '../contentevents/dto/create-contentevents.dto';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';
import { Disquscontacts } from '../disquscontacts/schemas/disquscontacts.schema';
import { Posts } from '../posts/schemas/posts.schema';
import { CreateInsightsDto, InsightsDto } from '../insights/dto/create-insights.dto';
import { Insights } from '../insights/schemas/insights.schema';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { Disquslogs } from '../disquslogs/schemas/disquslogs.schema';
import { DBRef, ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { UserauthsService } from '../../trans/userauths/userauths.service';
import { TemplatesRepo } from 'src/infra/templates_repo/schemas/templatesrepo.schema';

const Long = require('mongodb').Long;
@Controller('api/')
export class DisqusController {

  constructor(private readonly DisqusService: DisqusService,
    private readonly disquscontactsService: DisquscontactsService,
    //private readonly reactionsService: ReactionsService,
    private readonly utilsService: UtilsService,
    private readonly postDisqusService: PostDisqusService,
    private readonly disqusService: DisqusService,
    private readonly disqusLogService: DisquslogsService,
    private readonly insightsService: InsightsService,
    private readonly contenteventsService: ContenteventsService, 
    private readonly userauthsService: UserauthsService,
    private readonly errorHandler: ErrorHandler) { }

  @Post('disqus')
  async create(@Body() CreateDisqusDto: CreateDisqusDto) {
    await this.DisqusService.create(CreateDisqusDto);
  }

  @Get('disqus')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Disqus[]> {
    return this.DisqusService.findAll();
  }

  @Get('disqus/:email')
  async findOneId(@Param('email') email: string): Promise<Disqus> {
    return this.DisqusService.findOne(email);
  }

  @Delete('disqus/:id')
  async delete(@Param('id') id: string) {
    return this.DisqusService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @FormDataRequest()
  @Post('posts/disqus')
  async disqus(@Headers() headers, @Body() ContentDto_: ContentDto, ) {
    var email_header = headers['x-auth-user'];
    let type = "";
    let isQuery = 'false';
    let res = new DisqusResponseApps();    

    if (ContentDto_.eventType == undefined) {
      await this.errorHandler.generateNotAcceptableException('Unabled to proceed eventType is required',);
    } else {
      type = ContentDto_.eventType.toString();
    }

    if ((type == "DIRECT_MSG") || (type == "COMMENT")) {
      var isValid = false;
      isQuery = String(ContentDto_.isQuery);
      console.log("processDisqus >>> event: " + ContentDto_.eventType + " with isQuery: " + isQuery);
      if (isQuery == undefined || isQuery == 'false'){
        if (type == "DIRECT_MSG") {

          let xres = await this.buildDisqus(ContentDto_, true);

          console.log("processDisqus >>> receiver: ", xres.disqusLogs[0].receiver);
          this.disqusService.sendDMNotif(String(xres.room), JSON.stringify(xres));

          res.response_code = 202;
          let m = new Messages();
          m.info = ["The process successful"]
          res.messages = m;
          res.data = [xres];
          return res;
          //retVal.push(this.buildDisqus(ContentDto_, true));
          //ContentDto_.disqus = retVal;
          //isValid = true;
          //for (var retValCount = 0; retValCount < retVal.length; retValCount++){
          //  if (retVal[retValCount].room != undefined) {
          //    var roomName = retVal[retValCount].room;
          //  }
            // String roomName = AppUtils.getAsStr(it, QueryEnum.ROOM_FLD.getName());
            //var roomName = retVal[retValCount].room;
          //}
        } else if ((type == "COMMENT") && (ContentDto_.postID!=undefined)) {
          console.log("Payload Insert Comment >>>>>> : ", ContentDto_);
          if (ContentDto_.email==undefined){
            ContentDto_.email = email_header;
          } 
          if (ContentDto_.postID != undefined) {
            var Posts_ = new Posts();
            Posts_ = await this.postDisqusService.findid(ContentDto_.postID.toString());
            ContentDto_.receiverParty = Posts_.email;
            ContentDto_.postType = Posts_.postType;
          }
          if (ContentDto_.tagComment!=undefined){
            var _tagComment_ = ContentDto_.tagComment;
            ContentDto_.tagComment_ = _tagComment_.toString().split(',').map(function (n) {
              return n.toString();
            });
          }
          let xres = await this.buildComments(ContentDto_, true);
          if (ContentDto_.tagComment != undefined) {
            if (ContentDto_.tagComment_.length>0){
              for (var n = 0; n < ContentDto_.tagComment_.length;n++){
                var userAuth = await this.userauthsService.findByUsername(ContentDto_.tagComment_[n]);
                if (await this.utilsService.ceckData(userAuth)) {
                  var UserEmail = userAuth.email.toString();
                  this.sendCommentFCM(UserEmail, "COMMENT_TAG", ContentDto_.postID.toString(), ContentDto_.email.toString())
                }
              }
            }
          }

          if (ContentDto_.parentID != undefined) {
            if (ContentDto_.parentID != "") {
              var discuslogGet = await this.disqusLogService.findDisqusLogByParentID(ContentDto_.parentID.toString())
              if (await this.utilsService.ceckData(discuslogGet)) {
                var UserEmail = discuslogGet.sender.toString();
                if (ContentDto_.receiverParty != ContentDto_.email.toString()) {
                  this.sendCommentFCM(UserEmail, "COMMENT_TAG", ContentDto_.postID.toString(), ContentDto_.email.toString())
                }
              }
            }
          }
          if (ContentDto_.receiverParty != ContentDto_.email.toString()) {
            this.sendCommentFCM(ContentDto_.receiverParty.toString(), "COMMENT", ContentDto_.postID.toString(), ContentDto_.email.toString())
          }
          this.insightsService.updateComment(ContentDto_.receiverParty.toString())
          res.response_code = 202;
          let m = new Messages();
          m.info = ["The process successful"]
          res.messages = m;
          res.data = [xres];
          return res;
        }
      }else{
        if (type == "DIRECT_MSG") {
          
          console.log("processDisqus >>> DIRECT_MSG: ", String(ContentDto_.email));
          let tmp : DisqusResDto[] = [];

          let dm = [];
          if (ContentDto_.disqusID != undefined) {
            dm = await this.disqusService.queryDiscussV2ByDisqusIs(String(ContentDto_.disqusID));
          } else {
            dm = await this.disqusService.queryDiscussV2(String(ContentDto_.email));
          }

          if (dm != undefined && dm.length > 0) {
            for (let i = 0; i < dm.length; i++) {
              let o = dm[i];
              if (o.emot != undefined && o.emot.length > 0) {
                for (let x = 0; x < o.disqusLogs.length; x++) {
                  let dl = o.disqusLogs[x]; 
                  if (dl.reactionUri != undefined) {
                    for (let y = 0; y < o.emot.length; y++) {
                      if (dl.reactionUri == o.emot[y].URL) {
                        o.disqusLogs[x].reaction_icon = o.emot[y].icon;
                        break;
                      }
                    }
                  }
                }

              }
              tmp.push(o);
            }
          }

          res.data = tmp;

          /*
          var aDisqusContacts : any[] = []; 
          if (ContentDto_.receiverParty != undefined) {
            aDisqusContacts = await this.disquscontactsService.findDisqusByEmail(String(ContentDto_.email));
          } else {
            aDisqusContacts = await this.disquscontactsService.findByEmailAndMate(String(ContentDto_.email), String(ContentDto_.receiverParty));
          } 
          var withDetail = ContentDto_.withDetail;
          var detailOnly = ContentDto_.detailOnly;
          
          let tmp : DisqusResDto[] = [];
          for (let i = 0; i < aDisqusContacts.length; i++) {
            let con = aDisqusContacts[i];
            var retVal = new DisqusResDto();

            retVal.disqusID = con.disqus_data[0].disqusID;
            if ((aDisqusContacts[0].disqus_data[0].email != undefined) && (aDisqusContacts[0].disqus_data[0].mate != undefined)) {
              //if (detailOnly == undefined || detailOnly == false) {
                retVal.email = aDisqusContacts[0].disqus_data[0].email;
                retVal.room = aDisqusContacts[0].disqus_data[0].room;
  
                retVal.eventType = aDisqusContacts[0].disqus_data[0].eventType;
                retVal.active = aDisqusContacts[0].disqus_data[0].active;
                retVal.createdAt = aDisqusContacts[0].disqus_data[0].createdAt;
                retVal.updatedAt = aDisqusContacts[0].disqus_data[0].updatedAt;
                retVal.lastestMessage = aDisqusContacts[0].disqus_data[0].lastestMessage;
  
                var profile = await this.utilsService.generateProfile(aDisqusContacts[0].disqus_data[0].email, 'PROFILE');
                if (profile.username!=undefined){
                  retVal.username = profile.username;
                }
                if (profile.fullName != undefined) {
                  retVal.fullName = profile.fullName;
                }
                if (profile.avatar != undefined) {
                  retVal.avatar = profile.avatar;
                }
  
                var profile_mate = await this.utilsService.generateProfile(aDisqusContacts[0].disqus_data[0].mate, 'PROFILE');
                var mateInfo = {};
                if (profile_mate.username != undefined) {
                  mateInfo['username'] = profile_mate.username;
                }
                if (profile_mate.fullName != undefined) {
                  mateInfo['fullName'] = profile_mate.fullName;
                }
                if (profile_mate.avatar != undefined) {
                  mateInfo['avatar'] = profile_mate.avatar;
                }
                mateInfo['email'] = aDisqusContacts[0].disqus_data[0].mate;
                retVal.mate = mateInfo;
  
                var senderReciverInfo = {};
                var currentEmail = (ContentDto_.email) ? ContentDto_.email : email_header;
                if ((profile_mate != null) && (profile != null) && (currentEmail == profile_mate.email)) {
                  senderReciverInfo['email'] = profile.fullName;
                  senderReciverInfo['username'] = profile.username;
                  senderReciverInfo['fullName'] = profile.fullName;
                  if (profile.avatar != null) {
                    senderReciverInfo['avatar'] = profile.avatar;
                  }
                } else if ((profile_mate != null) && (profile != null) && (currentEmail == profile.email)) {
                  senderReciverInfo['email'] = profile_mate.fullName;
                  senderReciverInfo['username'] = profile_mate.username;
                  senderReciverInfo['fullName'] = profile_mate.fullName;
                  if (profile_mate.avatar != null) {
                    senderReciverInfo['avatar'] = profile_mate.avatar;
                  }
                }
                retVal.senderOrReceiverInfo = senderReciverInfo;
  
                if ((ContentDto_.pageNumber != undefined) && (ContentDto_.pageRow != undefined)) {
                  var pageNumber = Number(ContentDto_.pageNumber);
                  var pageRow = Number(ContentDto_.pageRow);
                  var offset = pageNumber * pageRow;
                  // retVal['disqusLogs'] = profile.avatar;
                  // retVal.put("disqusLogs",streamSupplier.get().skip(offset).limit(pageRow).collect(Collectors.toList()));
                } else {
                  // retVal['disqusLogs'] = profile.avatar;
                  // retVal.put("disqusLogs", streamSupplier.get().collect(Collectors.toList()));
                }
              //}            

              tmp.push(retVal);
          }

          res.data = tmp;

          if (withDetail || detailOnly) {

          }
          }
          */
        } else if (type == "COMMENT") {
          console.log("Payload Query Comment >>>>>> : ", ContentDto_);
          var DisqusResponseComment_ = new DisqusResponseComment();
          let com = await this.disqusService.findDisqusByPost(String(ContentDto_.postID), type);
          console.log('com',com);

          let tmp_: DisqusComment[] = [];
          for (let i = 0; i < com.length; i++) {
            let con = com[i];
            var retVal_ = new DisqusComment();

            retVal_.disqusID = con.disqusID; 
            retVal_.active = con.active;
            var profile = await this.utilsService.generateProfile(String(con.email), 'PROFILE');
            if (profile.fullName != undefined) {
              retVal_.fullName = profile.fullName;
            }
            if (profile.username != undefined) {
              retVal_.username = profile.username;
            }
            if (profile.avatar != undefined) {
              retVal_.avatar = profile.avatar;
            }
            retVal_.postId = con.postID.toString();
            retVal_.eventType = con.eventType;
            retVal_.disqusID = con.disqusID;
            retVal_.email = con.email;
            retVal_.updatedAt = con.updatedAt;
            retVal_.createdAt = con.createdAt; 

            let dl = await this.disqusLogService.findLogByDisqusId(String(con.disqusID), Number(ContentDto_.pageNumber), Number(ContentDto_.pageRow));
            retVal_.disqusLogs = dl;

            // if (detailOnly == undefined || detailOnly == false) {
            //   retVal.email = con.email;
            //   retVal.room = con.room;
            //   retVal.postId = String(con.postID);

            //   retVal.eventType = con.eventType;
            //   retVal.active = con.active;
            //   retVal.createdAt = con.createdAt;
            //   retVal.updatedAt = con.updatedAt;

              
            //   if (profile.username!=undefined){
            //     retVal.username = profile.username;
            //   }
            //   if (profile.avatar != undefined) {
            //     retVal.avatar = profile.avatar;
            //   }


            //   var senderReciverInfo = {};
            //   var currentEmail = (ContentDto_.email) ? ContentDto_.email : email_header;
            //   if ((profile_mate != null) && (profile != null) && (currentEmail == profile_mate.email)) {
            //     senderReciverInfo['email'] = profile.fullName;
            //     senderReciverInfo['username'] = profile.username;
            //     senderReciverInfo['fullName'] = profile.fullName;
            //     if (profile.avatar != null) {
            //       senderReciverInfo['avatar'] = profile.avatar;
            //     }
            //   } else if ((profile_mate != null) && (profile != null) && (currentEmail == profile.email)) {
            //     senderReciverInfo['email'] = profile_mate.fullName;
            //     senderReciverInfo['username'] = profile_mate.username;
            //     senderReciverInfo['fullName'] = profile_mate.fullName;
            //     if (profile_mate.avatar != null) {
            //       senderReciverInfo['avatar'] = profile_mate.avatar;
            //     }
            //   }
            //   retVal.senderOrReceiverInfo = senderReciverInfo;

            //   let dl = await this.disqusLogService.findLogByDisqusId(String(con.disqusID), Number(ContentDto_.pageNumber), Number(ContentDto_.pageRow));
            //   retVal.disqusLogs = dl;

            //   if ((ContentDto_.pageNumber != undefined) && (ContentDto_.pageRow != undefined)) {
            //     var pageNumber = Number(ContentDto_.pageNumber);
            //     var pageRow = Number(ContentDto_.pageRow);
            //     var offset = pageNumber * pageRow;
            //     // retVal['disqusLogs'] = profile.avatar;
            //     // retVal.put("disqusLogs",streamSupplier.get().skip(offset).limit(pageRow).collect(Collectors.toList()));
            //   } else {
            //     // retVal['disqusLogs'] = profile.avatar;
            //     // retVal.put("disqusLogs", streamSupplier.get().collect(Collectors.toList()));
            //   }
            // }                        
            tmp_.push(retVal_);
          }
          DisqusResponseComment_.data = tmp_;
          return DisqusResponseComment_;
        }

        isValid = true;
      }

      if (isValid) {
        res.response_code = 202;
        let ms = new Messages();
        ms.info = ["The process successful"];
        res.messages = ms;

        return res;
        //inDto.buildResultInfo(inDto.getEventType(), ResBundle.instance().bundleAsStr(ResBundle.PR_DEFAULT_SUCCESS));
      } else {
        //inDto.buildErrorInfo(inDto.getEventType(), ResBundle.instance().bundleAsStr(ResBundle.AC_ERR_DEFAULT));
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    //return await this.disquscontactsService.findByEmailAndMate(ContentDto_.email.toString(), ContentDto_.receiverParty.toString());
  }

  private async buildComments(inDto: ContentDto, buildInteractive: boolean) {
    var retVal = new DisqusResDto();
    var current_date = await this.utilsService.getDateTimeString();
    var Posts_ = new Posts();
    Posts_ = await this.postDisqusService.findid(inDto.postID.toString());
    if ((await this.utilsService.ceckData(Posts_))) {
      if (Posts_.active && Posts_.allowComments){
        var disqus = new CreateDisqusDto();
        var disqus_ = new CreateDisqusDto();
        disqus_ = await this.disqusService.findDisqusByPost_(Posts_.postID.toString(), "COMMENT");
        if (!(await this.utilsService.ceckData(disqus_))) {
          var data_id = await this.utilsService.generateId();
          disqus._id = data_id;
          disqus.disqusID = data_id;
          disqus.room = data_id;
          disqus.eventType = inDto.eventType;
          disqus.email = inDto.receiverParty;
          disqus.mate = inDto.email;
          disqus.active = true; 
          disqus.createdAt = current_date;
          disqus.updatedAt = current_date;
          disqus._class = "io.melody.hyppe.content.domain.Disqus";
          if (disqus.email!=undefined){
            if (disqus.email == "") {
              disqus.email = Posts_.email;
            }
          }
        }else{
          disqus = disqus_;
        }

        inDto.postContent = Posts_;
        inDto.postID = Posts_.postID;
        disqus.postID = Posts_.postID; 
        disqus.mate = null;
        if (buildInteractive) {
          var contentDto = new ContentDto();
          contentDto.eventType = "COMMENT";
          contentDto.postType = Posts_.postType;
          contentDto.receiverParty = Posts_.email;

          var InsightDto_ = new CreateInsightsDto();
          // InsightDto_ = this.validationEvent(contentDto);
          this.processInsightEvent(InsightDto_);
        }

        var parentLog = new CreateDisquslogsDto();
        if (inDto.parentID!=undefined){
          if (inDto.parentID != "") {
            parentLog = await this.disqusLogService.findDisqusLogByParentID(inDto.parentID.toString());
          }
        }

        var disqusLog = new CreateDisquslogsDto();
        if (inDto.parentID != undefined) {
          if (inDto.parentID != "") {
            var disqusLog_new = new CreateDisquslogsDto();
            disqusLog_new._id = await this.utilsService.generateId(); 
            disqusLog_new.disqusID = disqus.disqusID;
            disqusLog_new.sequenceNumber = Number(parentLog.sequenceNumber)+1;
            disqusLog_new.active = true;
            disqusLog_new.createdAt = current_date;
            disqusLog_new.updatedAt = current_date;
            disqusLog_new.parentID = inDto.parentID;
            disqusLog_new.sender = inDto.email;
            disqusLog_new.receiver = inDto.receiverParty;
            disqusLog_new.postType = inDto.postType;
            disqusLog_new.txtMessages = inDto.txtMessages;
            disqusLog_new.reactionUri = inDto.reactionUri;
            disqusLog_new._class = "io.melody.hyppe.content.domain.DisqusLog";
            if (await this.utilsService.ceckData(inDto.postContent)){
              disqusLog_new.postID = inDto.postContent.postID;
              var media = await this.postDisqusService.findOnepostID(inDto.postContent.postID.toString());
              var media_ = {}
              if (await this.utilsService.ceckData(media)) {
                if (inDto.postContent.createdAt != undefined) {
                  media_["createdAt"] = inDto.postContent.createdAt;
                }
                if (media[0].datacontent[0].mediaBasePath != undefined) {
                  media_["mediaBasePath"] = media[0].datacontent[0].mediaBasePath;
                }
                if (inDto.postContent.postType != undefined) {
                  media_["postType"] = inDto.postContent.postType;
                }
                if (media[0].datacontent[0].mediaUri != undefined) {
                  media_["mediaUri"] = media[0].datacontent[0].mediaUri;
                }
                if (media[0].datacontent[0].mediaUri != undefined) {
                  media_["mediaThumbUri"] = media[0].datacontent[0].mediaThumb;
                }
                if (inDto.postContent.description != undefined) {
                  media_["description"] = inDto.postContent.description;
                }
                if (inDto.postContent.active != undefined) {
                  media_["active"] = inDto.postContent.active;
                }
                if (media[0].datacontent[0].mediaType != undefined) {
                  media_["mediaType"] = media[0].datacontent[0].mediaType;
                }
                if (media[0].datacontent[0].mediaType != undefined) {
                  media_["mediaThumbEndpoint"] = "/thumb/" + inDto.postContent.postID;
                }
                if (inDto.postContent.postID != undefined) {
                  media_["postID"] = inDto.postContent.postID;
                }
                if (media[0].datacontent[0].mediaUri != undefined) {
                  media_["mediaEndpoint"] = "/stream/" + media[0].datacontent[0].mediaUri;
                }
                if (media[0].datacontent[0].apsara != undefined) {
                  media_["apsara"] = media[0].datacontent[0].apsara
                }
                if (media[0].datacontent[0].apsaraId != undefined) {
                  media_["apsaraId"] = media[0].datacontent[0].apsaraId
                }
              }
              disqusLog_new.medias = [media_];
            }
            if (inDto.tagComment != undefined) {
              var array_data = [];
              for (let i = 0; i < inDto.tagComment_.length; i++) {
                var user = await this.userauthsService.findOneUsername(inDto.tagComment_[i]);
                if (await this.utilsService.ceckData(user)) {
                  array_data.push({
                    $ref: 'userauths',
                    $id: new ObjectId(user._id.toString()),
                    $db: 'hyppe_content_db',
                  });
                }
              }
              disqusLog_new.tags = Object(array_data);
            }
            disqusLog = disqusLog_new;
          } else {
            var disqusLog_new = new CreateDisquslogsDto();
            disqusLog_new._id = await this.utilsService.generateId(); 
            disqusLog_new.disqusID = disqus.disqusID;
            disqusLog_new.sender = inDto.email;
            disqusLog_new.sequenceNumber = 0;
            disqusLog_new.active = true;
            disqusLog_new.receiver = inDto.receiverParty;
            disqusLog_new.postType = inDto.postType;
            disqusLog_new.txtMessages = inDto.txtMessages;
            disqusLog_new.reactionUri = inDto.reactionUri;
            disqusLog_new.updatedAt = current_date;
            disqusLog_new.createdAt = current_date;
            disqusLog_new._class = "io.melody.hyppe.content.domain.DisqusLog";

            if (await this.utilsService.ceckData(inDto.postContent)) {
              disqusLog_new.postID = inDto.postContent.postID;
              var media = await this.postDisqusService.findOnepostID(inDto.postContent.postID.toString());
              var media_ = {}
              if (await this.utilsService.ceckData(media)) {
                if (inDto.postContent.createdAt != undefined) {
                  media_["createdAt"] = inDto.postContent.createdAt;
                }
                if (media[0].datacontent[0].mediaBasePath != undefined) {
                  media_["mediaBasePath"] = media[0].datacontent[0].mediaBasePath;
                }
                if (inDto.postContent.postType != undefined) {
                  media_["postType"] = inDto.postContent.postType;
                }
                if (media[0].datacontent[0].mediaUri != undefined) {
                  media_["mediaUri"] = media[0].datacontent[0].mediaUri;
                }
                if (media[0].datacontent[0].mediaUri != undefined) {
                  media_["mediaThumbUri"] = media[0].datacontent[0].mediaThumb;
                }
                if (inDto.postContent.description != undefined) {
                  media_["description"] = inDto.postContent.description;
                }
                if (inDto.postContent.active != undefined) {
                  media_["active"] = inDto.postContent.active;
                }
                if (media[0].datacontent[0].mediaType != undefined) {
                  media_["mediaType"] = media[0].datacontent[0].mediaType;
                }
                if (media[0].datacontent[0].mediaType != undefined) {
                  media_["mediaThumbEndpoint"] = "/thumb/" + inDto.postContent.postID;
                }
                if (inDto.postContent.postID != undefined) {
                  media_["postID"] = inDto.postContent.postID;
                }
                if (media[0].datacontent[0].mediaUri != undefined) {
                  media_["mediaEndpoint"] = "/stream/" + media[0].datacontent[0].mediaUri;
                }
                if (media[0].datacontent[0].apsara != undefined) {
                  media_["apsara"] = media[0].datacontent[0].apsara
                }
                if (media[0].datacontent[0].apsaraId != undefined) {
                  media_["apsaraId"] = media[0].datacontent[0].apsaraId
                }
              }
              disqusLog_new.medias = [media_];
            }
            if (inDto.tagComment != undefined) {
              var array_data = [];
              for (let i = 0; i < inDto.tagComment_.length; i++) {
                var user = await this.userauthsService.findOneUsername(inDto.tagComment_[i]);
                if (await this.utilsService.ceckData(user)) {
                  array_data.push({
                    $ref: 'userauths',
                    $id: new ObjectId(user._id.toString()),
                    $db: 'hyppe_trans_db',
                  });
                }
              }
              disqusLog_new.tags = Object(array_data);
            }
            disqusLog = disqusLog_new;
          }
        } else {
          var disqusLog_new = new CreateDisquslogsDto();
          disqusLog_new._id = await this.utilsService.generateId();
          disqusLog_new.disqusID = disqus.disqusID;
          disqusLog_new.sender = inDto.email;
          disqusLog_new.sequenceNumber = 0;
          disqusLog_new.active = true;
          disqusLog_new.postType = inDto.postType
          disqusLog_new.updatedAt = current_date;
          disqusLog_new.createdAt = current_date;
          disqusLog_new.sender = inDto.email;
          disqusLog_new.receiver = inDto.receiverParty;
          disqusLog_new.postType = inDto.postType;
          disqusLog_new.txtMessages = inDto.txtMessages;
          disqusLog_new.reactionUri = inDto.reactionUri;
          disqusLog_new._class = "io.melody.hyppe.content.domain.DisqusLog";

          if (await this.utilsService.ceckData(inDto.postContent)) {
            disqusLog_new.postID = inDto.postContent.postID;
            var media = await this.postDisqusService.findOnepostID(inDto.postContent.postID.toString());
            var media_ = {}
            if (await this.utilsService.ceckData(media)) {
              if (inDto.postContent.createdAt != undefined) {
                media_["createdAt"] = inDto.postContent.createdAt;
              }
              if (media[0].datacontent[0].mediaBasePath != undefined) {
                media_["mediaBasePath"] = media[0].datacontent[0].mediaBasePath;
              }
              if (inDto.postContent.postType != undefined) {
                media_["postType"] = inDto.postContent.postType;
              }
              if (media[0].datacontent[0].mediaUri != undefined) {
                media_["mediaUri"] = media[0].datacontent[0].mediaUri;
              }
              if (media[0].datacontent[0].mediaUri != undefined) {
                media_["mediaThumbUri"] = media[0].datacontent[0].mediaThumb;
              }
              if (inDto.postContent.description != undefined) {
                media_["description"] = inDto.postContent.description;
              }
              if (inDto.postContent.active != undefined) {
                media_["active"] = inDto.postContent.active;
              }
              if (media[0].datacontent[0].mediaType != undefined) {
                media_["mediaType"] = media[0].datacontent[0].mediaType;
              }
              if (media[0].datacontent[0].mediaType != undefined) {
                media_["mediaThumbEndpoint"] = "/thumb/" + inDto.postContent.postID;
              }
              if (inDto.postContent.postID != undefined) {
                media_["postID"] = inDto.postContent.postID;
              }
              if (media[0].datacontent[0].mediaUri != undefined) {
                media_["mediaEndpoint"] = "/stream/" + media[0].datacontent[0].mediaUri;
              }
              if (media[0].datacontent[0].apsara != undefined) {
                media_["apsara"] = media[0].datacontent[0].apsara
              }
              if (media[0].datacontent[0].apsaraId != undefined) {
                media_["apsaraId"] = media[0].datacontent[0].apsaraId
              }
            }
            disqusLog_new.medias = [media_];
          }
          if (inDto.tagComment != undefined) {
            var array_data = [];
            for (let i = 0; i < inDto.tagComment_.length; i++) {
              var user = await this.userauthsService.findOneUsername(inDto.tagComment_[i]);
              if (await this.utilsService.ceckData(user)) {
                array_data.push({
                  $ref: 'userauths',
                  $id: new ObjectId(user._id.toString()),
                  $db: 'hyppe_trans_db',
                });
              }
            }
            disqusLog_new.tags = Object(array_data);
          }
          disqusLog = disqusLog_new;
        }

        if (parentLog._id != undefined) {
          var createDisquslogsDto_ = new CreateDisquslogsDto();
          if (parentLog.replyLogs != undefined){
            if (parentLog.replyLogs != null) {
              var data_replyLogs = parentLog.replyLogs;
              data_replyLogs.push({
                $ref: 'disquslogs',
                $id: disqusLog._id,
                $db: 'hyppe_content_db',
              });
              createDisquslogsDto_.replyLogs = data_replyLogs;
            } else {
              createDisquslogsDto_.replyLogs = [
                {
                  $ref: 'disquslogs',
                  $id: disqusLog._id,
                  $db: 'hyppe_content_db',
                }
              ]
            }
          }else{
            createDisquslogsDto_.replyLogs = [
              {
                $ref: 'disquslogs',
                $id: disqusLog._id,
                $db: 'hyppe_content_db',
              }
            ]
          }
          await this.disqusLogService.update(parentLog._id.toString(),createDisquslogsDto_);
        }

        if (disqus.disqusLogs!=undefined){
          const data_disqusLogs = disqus.disqusLogs;
          data_disqusLogs.push({
            $ref: 'disquslogs',
            $id: disqusLog._id.toString(),
            $db: 'hyppe_content_db',
          });
        }else{
          disqus.disqusLogs = [{
            $ref: 'disquslogs',
            $id: disqusLog._id.toString(),
            $db: 'hyppe_content_db',
          }]
        }

        await this.disqusLogService.create(disqusLog);
        await this.disqusService.create(disqus);
        retVal = await this.aggrDetailDisqusLog(disqus, disqusLog);
      }
    }
    return retVal;
  } 
  
  private async aggrDetailDisqusLog(disqus: CreateDisqusDto, disqusLog: CreateDisquslogsDto) {
    var retVal = new DisqusResDto();
    let retLineVal: DisquslogsDto[] = [];
    if (disqus.eventType =="COMMENT") {
      retVal["postID"] = disqus.postID;
    } else {
      retVal["room"] = disqus.room;
    }
    var profile = await this.utilsService.generateProfile(disqus.email.toString(),"FULL");
    if (profile != null) {
      retVal["username"] = profile.username;
      retVal["fullName"] = profile.fullName;
      if (profile.avatar != null) {
        retVal["avatar"] = profile.avatar;
      }
    }
    retVal["email"] = disqus.email;
    if (disqus.mate!=undefined){
      if (disqus.mate != "") {
        var mateInfo = {};
        var mateProfile = await this.utilsService.generateProfile(disqus.mate.toString(), "FULL");
        if (profile != null) {
          mateInfo['username'] = mateProfile.username;
          mateInfo['fullName'] = mateProfile.fullName;
          if (mateProfile.avatar != null) {
            mateInfo['avatar'] = mateProfile.avatar;
          } 
        }
        mateInfo['email'] = mateProfile.email;
        retVal["mate"] = mateInfo;
      }
    }

    var line = new DisquslogsDto();
    line["disqusID"] = disqusLog.disqusID;
    line["postType"] = disqusLog.postType;
    if (disqusLog.postID!=undefined){
      if (disqusLog.postID != "") {
        var Posts_ = new Posts();
        Posts_ = await this.postDisqusService.findid(disqusLog.postID.toString());
        line["content"] = Posts_;
      }
    }
    line["lineID"] = disqusLog._id;
    line["sequenceNumber"] = disqusLog.sequenceNumber;
    line["sender"] = disqusLog.sender;
    var mateProfile = await this.utilsService.generateProfile(disqusLog.sender.toString(), "FULL");
    var mateInfo = {};
    if (mateProfile != null) {
      mateInfo["username"] = mateProfile.username;
      mateInfo["fullName"] = mateProfile.fullName;
      if (mateProfile.avatar != null) {
        mateInfo['avatar'] = mateProfile.avatar;
      }
      line["senderInfo"] = mateInfo;
    }
    line["receiver"] = disqusLog.receiver;
    line["active"] = disqusLog.active;
    line["createdAt"] = disqusLog.createdAt;
    line["updatedAt"] = disqusLog.updatedAt;
    line["txtMessages"] = disqusLog.txtMessages;
    retLineVal.push(line);
    //retVal["disqusLogs"] = retLineVal;
    retVal.disqusLogs = retLineVal;
    return retVal;
  }

  private async validationEvent(contentDto: ContentDto): Promise<CreateInsightsDto> {
    var Insights_ = new CreateInsightsDto();
    return Insights_;
  }

  private async processInsightEvent(insightDto: CreateInsightsDto) {

  }

  private async aggrDisqusLog(eventType: string, DisqusLog: CreateDisquslogsDto){
    var retVal = {};
    retVal["disqusID"] = DisqusLog.disqusID;
    retVal["postType"] = DisqusLog.postType;

    if ((DisqusLog.postID != undefined) && (eventType =="DIRECT_MSG")) {
      var post = this.postDisqusService.findOnepostID(DisqusLog.postID.toString());
      retVal["content"] = post;
    }
    retVal["lineID"] = DisqusLog._id;
    retVal["sender"] = DisqusLog.sender;

    if (eventType == "COMMENT") {
      var mateInfo = {};
      var profile_mate = await this.utilsService.generateProfile(DisqusLog.sender.toString(), 'PROFILE');
      if ((profile_mate != null)) {
        mateInfo['email'] = profile_mate.fullName;
        mateInfo['username'] = profile_mate.username;
        mateInfo['fullName'] = profile_mate.fullName;
        if (profile_mate.avatar != null) {
          mateInfo['avatar'] = profile_mate.avatar;
        } 
        retVal["senderInfo"] = mateInfo;
      }
    }
    retVal["receiver"] = DisqusLog.receiver;
    retVal["active"] = DisqusLog.active;
    retVal["createdAt"] = DisqusLog.createdAt;
    retVal["updatedAt"] = DisqusLog.updatedAt;
    retVal["txtMessages"] = DisqusLog.txtMessages;
    retVal["reactionUri"] = DisqusLog.reactionUri;

    // var reaction = 
    // io.melody.hyppe.infra.domain.Reactions reaction = this.findReactionByURI(item.getReactionUri());
    // if (reaction != null) {
    //   retVal.put("reaction_icon", reaction.getIcon());
    // }

    return retVal;
  }

  private async aggrDisqusLogV2(eventType: string, DisqusLog: Disquslogs){
    var retVal = new DisquslogsDto();
    retVal.disqusID = DisqusLog.disqusID;
    retVal.postType = DisqusLog.postType;

    if ((DisqusLog.postID != undefined) && (eventType =="DIRECT_MSG")) {
      var post = this.postDisqusService.findOnepostID(DisqusLog.postID.toString());
      //retVal.content = post;
    }
    //retVal.lineID = DisqusLog._id;
    retVal.sender = DisqusLog.sender;

    if (eventType == "COMMENT") {
      var mateInfo = {};
      var profile_mate = await this.utilsService.generateProfile(DisqusLog.sender.toString(), 'PROFILE');
      if ((profile_mate != null)) {
        mateInfo['email'] = profile_mate.fullName;
        mateInfo['username'] = profile_mate.username;
        mateInfo['fullName'] = profile_mate.fullName;
        if (profile_mate.avatar != null) {
          mateInfo['avatar'] = profile_mate.avatar;
        } 
        //retVal.senderInfo = mateInfo;
      }
    }
    retVal.receiver = DisqusLog.receiver;
    retVal.active = DisqusLog.active;
    retVal.createdAt = DisqusLog.createdAt;
    retVal.updatedAt = DisqusLog.updatedAt;
    retVal.txtMessages = DisqusLog.txtMessages;
    retVal.reactionUri = DisqusLog.reactionUri;

    // var reaction = 
    // io.melody.hyppe.infra.domain.Reactions reaction = this.findReactionByURI(item.getReactionUri());
    // if (reaction != null) {
    //   retVal.put("reaction_icon", reaction.getIcon());
    // }

    return retVal;
  }  

  private async buildDisqus(dto: ContentDto, buildInteractive: boolean) {
    let cts = await this.disquscontactsService.findByEmailAndMate(dto.email.toString(), dto.receiverParty.toString());
    let dis = new Disqus();
    if (cts != undefined && cts.length > 0) {
      let ct = cts[0];
      console.log(ct.disqus_data_.disqusID);
      dis = await this.disqusService.findById(ct.disqus_data_.disqusID);
      console.log(dis._id);
    } else {
      var DataId = await this.utilsService.generateId();
      dis._id = DataId;
      dis.room = DataId;
      dis.disqusID = DataId;
      dis.eventType = dto.eventType;
      dis.email = dto.email;
      dis.mate = dto.receiverParty;
      dis.active = dto.active;
      dis.createdAt = await this.utilsService.getDateTimeString();
      dis.updatedAt = await this.utilsService.getDateTimeString();      
    }

    if (dto.postID != undefined) {
      if (buildInteractive) {
        // Add reaction in post
        // let post = await this.postDisqusService.findid(dto.postID.toString());
        // let y = Number(post.reactions);
        // y = y + 1;
        // let yy = <any> y;
        // post.reactions = yy;

        // let cser = await this.contenteventsService.findSenderOrReceiverByPostID(String(post.postID), 'REACTION', String(dto.email), String(dto.receiverParty));

        // let insSender = this.insightsService.findemail(String(dto.email));
        // let insReceiver = this.insightsService.findemail(String(dto.receiverParty));
      }
    }

    //add disquslog

    let dl = new Disquslogs();
    var dlid = await this.utilsService.generateId();
    dl.createdAt = await this.utilsService.getDateTimeString();
    dl._id = dlid;
    dl.sender = dto.email;
    dl.receiver = dto.receiverParty;
    dl.postType = dto.postType;
    dl.txtMessages = dto.txtMessages;
    dl.reactionUri = dto.reactionUri;
    if (dto.postID != undefined) {
      dl.postID = dto.postID;
    }
    let ndl = await this.disqusLogService.create(dl);

    let agg = await this.aggrDisqusLogV2(String(dto.eventType), dl);
    let retVal = new DisqusResDto();
    let arr : DisquslogsDto[] = [];
    arr.push(agg);
    retVal.disqusLogs = arr;
  
    var usp = { "$ref": "disquslogs", "$id": String(ndl._id), "$db": "hyppe_content_db" };
    let usparr = [];
    if (dis.disqusLogs != undefined) {
      usparr = dis.disqusLogs;
    }
    usparr.push(usp);
    dis.disqusLogs = usparr;

    dis.updatedAt = dl.createdAt;
    dis.lastestMessage = dl.txtMessages.substring(0, 21);
    dis.mateActive = true;
    dis.emailActive = true;
    this.disqusService.create(dis);

    if (cts == undefined || cts.length < 1) {

      let c0 = new Disquscontacts();
      var usy = { "$ref": "disqus", "$id": String(dis._id), "$db": "hyppe_content_db" };
      c0.disqus = usy;
      var c0id = await this.utilsService.generateId();
      c0._id = c0id;
      c0.mate = dto.receiverParty;
      c0.email = dto.email;
      this.disquscontactsService.create(c0);

      let c1 = new Disquscontacts();
      var usy = { "$ref": "disqus", "$id": String(dis._id), "$db": "hyppe_content_db" };
      c1.disqus = usy;
      var c1id = await this.utilsService.generateId();
      c1._id = c1id;
      c1.mate = dto.email;
      c1.email = dto.receiverParty;
      this.disquscontactsService.create(c1);
    }

    retVal.email = dis.email;
    retVal.room = dis.room;

    retVal.eventType = dis.eventType;
    retVal.active = dis.active;
    retVal.createdAt = dis.createdAt;
    retVal.updatedAt = dis.updatedAt;
    retVal.lastestMessage = dis.lastestMessage;

    var profile = await this.utilsService.generateProfile(String(dis.email), 'PROFILE');
    if (profile.username!=undefined){
      retVal.username = profile.username;
    }
    if (profile.fullName != undefined) {
      retVal.fullName = profile.fullName;
    }
    if (profile.avatar != undefined) {
      retVal.avatar = profile.avatar;
    }

    var profile_mate = await this.utilsService.generateProfile(String(dis.mate), 'PROFILE');
    var mateInfo = {};
    if (profile_mate.username != undefined) {
      mateInfo['username'] = profile_mate.username;
    }
    if (profile_mate.fullName != undefined) {
      mateInfo['fullName'] = profile_mate.fullName;
    }
    if (profile_mate.avatar != undefined) {
      mateInfo['avatar'] = profile_mate.avatar;
    }
    mateInfo['email'] = dis.mate;
    retVal.mate = mateInfo;

    var senderReciverInfo = {};
    var currentEmail = dto.email;
    if ((profile_mate != null) && (profile != null) && (currentEmail == profile_mate.email)) {
      senderReciverInfo['email'] = profile.fullName;
      senderReciverInfo['username'] = profile.username;
      senderReciverInfo['fullName'] = profile.fullName;
      if (profile.avatar != null) {
        senderReciverInfo['avatar'] = profile.avatar;
      }
    } else if ((profile_mate != null) && (profile != null) && (currentEmail == profile.email)) {
      senderReciverInfo['email'] = profile_mate.fullName;
      senderReciverInfo['username'] = profile_mate.username;
      senderReciverInfo['fullName'] = profile_mate.fullName;
      if (profile_mate.avatar != null) {
        senderReciverInfo['avatar'] = profile_mate.avatar;
      }
    }
    retVal.senderOrReceiverInfo = senderReciverInfo;

    return retVal;
  }

  private async buildDisqus0(ContentDto_: ContentDto, buildInteractive: boolean) {
    var cts :Disquscontacts[] = [];
    cts = await this.disquscontactsService.findByEmailAndMate(ContentDto_.email.toString(), ContentDto_.receiverParty.toString());
    if (await this.utilsService.ceckData(cts)){
      for (let i = 0; i < cts.length; i++) {
        let ct = cts[i];

        var IdDisqus = ct.disqus.$id.toString();
        var Disqus_ = new Disqus();
        if (ct.disqus != null) {
          Disqus_ = await this.DisqusService.findOne(IdDisqus);
        } else {
          var DataId = await this.utilsService.generateId();
          Disqus_._id = DataId;
          Disqus_.room = DataId;
          Disqus_.disqusID = ContentDto_.disqusID;
          Disqus_.eventType = ContentDto_.eventType;
          Disqus_.email = ContentDto_.email;
          Disqus_.mate = ContentDto_.mate;
          Disqus_.active = ContentDto_.active;
          Disqus_.createdAt = await this.utilsService.getDateTimeString();
          Disqus_.updatedAt = await this.utilsService.getDateTimeString();
        }
        
        if (ContentDto_.postID != undefined) {
          var Posts_ = new Posts();
          Posts_ = await this.postDisqusService.findid(ContentDto_.postID.toString());
          if (await this.utilsService.ceckData(Posts_)) {
            ContentDto_.postContent = Posts_;
            ContentDto_.postType = Posts_.postType;
            if (buildInteractive){
              var _ContentDto_ = new ContentDto();
              _ContentDto_ = ContentDto_;
              _ContentDto_.eventType = "REACTION";
              _ContentDto_.postType = Posts_.postType;
              _ContentDto_.receiverParty = Posts_.email;
              _ContentDto_.reactionUri = ContentDto_.reactionUri;
  
              // var InsightsDto_ = new InsightsDto();
              // InsightsDto_ = await this.validationEvent(ContentDto_);
              // await this.processInsightEvent(InsightsDto_);
            }
          }
        }        
      }

    }
  }

  @Post('posts/disqus/deletedicuss')
  @UseGuards(JwtAuthGuard)
  async deletedicuss(
    @Headers() headers,
    @Body() request: any) {
    return this.DisqusService.deletedicuss(request);
  }

  async sendCommentFCM(email: string, type: string, postID: string, receiverParty: string) {
    // var Templates_ = new TemplatesRepo();
    // Templates_ = await this.utilsService.getTemplate_repo(type, 'NOTIFICATION');

    // var get_username_email = await this.utilsService.getUsertname(email);
    // var get_username_receiverParty = await this.utilsService.getUsertname(receiverParty);

    // var email = receiverParty;
    // var titlein = get_username_email?.toString() || '';
    // var titleen = get_username_email?.toString() || '';
    // var bodyin = "";
    // var bodyen = "";


    var posts = await this.postDisqusService.findid(postID);
    // var bodyin_get = Templates_.body_detail_id.toString();
    // var bodyen_get = Templates_.body_detail.toString();

    var post_type = "";
    if (await this.utilsService.ceckData(posts)) {
      post_type = posts.postType.toString();
    }

    // var new_bodyin_get = bodyin_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));
    // var new_bodyen_get = bodyen_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));

    // var bodyin = new_bodyin_get;
    // var bodyen = new_bodyen_get;
    
    // var eventType = type.toString();
    // var event = "ACCEPT";
    // await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event, postID, post_type);
    await this.utilsService.sendFcmV2(email, receiverParty, type.toString(), "ACCEPT", type, postID, post_type)
  }
}
