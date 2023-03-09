import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGetcontenteventsDto } from 'src/trans/getusercontents/getcontentevents/dto/create-getcontentevents.dto';
import { Userbasic } from 'src/trans/userbasics/schemas/userbasic.schema';
import { CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents, ContenteventsDocument } from './schemas/contentevents.schema';

@Injectable()
export class ContenteventsService {
  constructor(
    @InjectModel(Contentevents.name, 'SERVER_FULL')
    private readonly ContenteventsModel: Model<ContenteventsDocument>,
  ) { }

  async create(
    CreateContenteventsDto: CreateContenteventsDto,
  ): Promise<Contentevents> {
    const createContenteventsDto = await this.ContenteventsModel.create(CreateContenteventsDto);
    return createContenteventsDto;
  }

  async createNew(
    data: Contentevents,
  ): Promise<Contentevents> {
    const createContenteventsDto = await this.ContenteventsModel.create(
      CreateContenteventsDto,
    );
    return createContenteventsDto;
  }

  async findAll(): Promise<Contentevents[]> {
    return this.ContenteventsModel.find().exec();
  }

  async findFollowing(email: String): Promise<Contentevents[]> {
    let query = this.ContenteventsModel.find();
    query.where('eventType', 'FOLLOWING');
    query.where('email', email);
    return query.exec();
  }

  async findisLike(email: string, postID: string) {
    let query = this.ContenteventsModel.aggregate([

      {
        $match:
        {

          "postID": postID,
          "email": email,
          "eventType": "LIKE",
          "event": "DONE"

        }
      },

      {
        $project: {
          postID: 1,
          email: 1
        }
      }

    ]);

    return query.exec();
  }
  async updateNoneActive(email: string) {
    this.ContenteventsModel.updateMany(
      {
        email: email,
      },
      {
        $set: {
          "active": false,
          "email": email + '_noneactive'
        }
      },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async getConteneventbyType(CreateGetcontenteventsDto_: CreateGetcontenteventsDto): Promise<Contentevents[]> {
    return this.ContenteventsModel.find({
      active: CreateGetcontenteventsDto_.active,
      postID: CreateGetcontenteventsDto_.postID,
      eventType: CreateGetcontenteventsDto_.eventType,
      receiverParty: CreateGetcontenteventsDto_.receiverParty,
    }).skip(CreateGetcontenteventsDto_.skip).limit(CreateGetcontenteventsDto_.limit).exec();
  }

  //    async findOne(id: string): Promise<Contentevents> {
  //     return this.ContenteventsModel.findOne({ _id: id }).exec();
  //   }
  async findAllCategory(CreateGetcontenteventsDto_: CreateGetcontenteventsDto): Promise<Contentevents> {
    return this.ContenteventsModel.findOne(CreateGetcontenteventsDto_).exec();
  }

  async findParentBySender(eventType: string, email: string, senderParty: string, flowIsDone: boolean): Promise<Contentevents> {
    return this.ContenteventsModel.findOne({ eventType: eventType, email: email, senderParty: senderParty, flowIsDone: flowIsDone }).exec();
  }

  async findParentByReceiver(eventType: string, receiverParty: string, email: string, flowIsDone: boolean): Promise<Contentevents> {
    return this.ContenteventsModel.findOne({ eventType: eventType, email: email, receiverParty: receiverParty, flowIsDone: flowIsDone }).exec();
  }

  async findSenderOrReceiverByPostID(postID: string, eventType: string, email: string, receiverParty: string): Promise<Contentevents> {
    return await this.ContenteventsModel.findOne({ postID: postID, eventType: eventType, email: email, receiverParty: receiverParty }).exec();
  }

  async findSenderOrReceiver(eventType: string, email: string, receiverParty: string): Promise<Contentevents> {
    return await this.ContenteventsModel.findOne(
      {
        $and:
          [
            { eventType: eventType },
            { email: email },
            {
              $or:
                [
                  { receiverParty: receiverParty },
                  { senderParty: receiverParty }
                ]
            }
          ]
      }).exec();
  }

  async findOne(email: string): Promise<Contentevents> {
    return this.ContenteventsModel.findOne({ email: email }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.ContenteventsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async UserActivityNow(date: Date): Promise<Object> {
    const HoursArray = [
      '00:00-01:00',
      '01:00-02:00',
      '02:00-03:00',
      '03:00-04:00',
      '04:00-05:00',
      '05:00-06:00',
      '06:00-07:00',
      '07:00-08:00',
      '08:00-09:00',
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '12:00-13:00',
      '13:00-14:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00',
      '18:00-19:00',
      '19:00-20:00',
      '20:00-21:00',
      '21:00-22:00',
      '22:00-23:00',
      '23:00-00:00',
    ];
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
        },
      },
      {
        $match: {
          createdAt_date_only: date,
        },
      },
      {
        $project: {
          h: { $hour: '$createdAt_' },
          email: '$email',
        },
      },
      {
        $group: {
          _id: {
            hour_group: '$h',
            email_group: '$email',
          },
          email_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.hour_group',
          log: {
            $push: {
              email: '$_id.email_group',
              count_activity: '$email_count',
            },
          },
          count: { $sum: '$email_count' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: date,
          hour: {
            $arrayElemAt: [
              HoursArray,
              {
                $subtract: ['$_id', 0],
              },
            ],
          },
          user_activity_count: { $size: '$log' },
          count_all_activity: '$count',
          user_activity: '$log',
        },
      },
    ]).exec();
    return GetCount;
  }

  async UserActivityYear(year: number): Promise<Object> {
    var currentTime = new Date();
    var year_param = 0;
    if (year != undefined) {
      year_param = year;
    } else {
      year_param = currentTime.getFullYear();
    }
    const monthsArray = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
          YearcreatedAt: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
          year_param: { $toInt: year_param.toString() },
        },
      },
      {
        $match: {
          YearcreatedAt: year_param,
        },
      },
      // {
      //   $sort: { createdAt_: 1 },
      // },
      {
        $group: {
          _id: {
            year_month: { $substrCP: ['$createdAt', 0, 7] },
            email_group: '$email',
          },
          email_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.year_month',
          log: {
            $push: {
              email: '$_id.email_group',
              count_activity: '$email_count',
            },
          },
          count: { $sum: '$email_count' },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          month_int: { $toInt: { $substrCP: ['$_id', 5, 2] } },
          month_: { $substrCP: ['$_id', 5, 2] },
          monet: '$log',
          month_name_: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [{ $toInt: { $substrCP: ['$_id', 5, 2] } }, 1],
              },
            ],
          },
          year_: { $substrCP: ['$_id', 0, 4] },
        },
      },
      {
        $sort: { month_int: 1 },
      },
      {
        $project: {
          _id: 0,
          year: { $toInt: '$year_' },
          month: '$month_',
          month_name: '$month_name_',
          //monitize: '$monet',
          count_user: { $size: '$monet' },
        },
      },
      // {
      //   $sort: { createdAt_: 1 },
      // },
      // {
      //   $group: {
      //     _id: {
      //       createdAt_data: '$createdAt_date_only',
      //       email_group: '$email',
      //     },
      //     email_count: { $sum: 1 },
      //   },
      // },
      // {
      //   $group: {
      //     _id: '$_id.createdAt_data',
      //     log: {
      //       $push: {
      //         email: '$_id.email_group',
      //         count_activity: '$email_count',
      //       },
      //     },
      //     count: { $sum: '$email_count' },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     date: '$_id',
      //     user_activity_count: { $size: '$log' },
      //     count_all_activity: '$count',
      //     user_activity: '$log',
      //   },
      // },
      // {
      //   $sort: { date: 1 },
      // },
    ]).exec();
    return GetCount;
  }

  async UserActivityBeforeToday(day: number): Promise<Object> {
    if (day == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    var TODAY = new Date();
    var TODAY_BEFORE = new Date(new Date().setDate(new Date().getDate() - day));
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
          today: { $toDate: { $substrCP: [TODAY, 0, 10] } },
          today_before: { $toDate: { $substrCP: [TODAY_BEFORE, 0, 10] } },
        },
      },
      {
        $match: {
          createdAt_: { $gte: TODAY_BEFORE, $lt: TODAY },
        },
      },
      {
        $sort: { createdAt_: 1 },
      },
      {
        $group: {
          _id: {
            createdAt_data: '$createdAt_date_only',
            email_group: '$email',
          },
          email_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.createdAt_data',
          log: {
            $push: {
              email: '$_id.email_group',
              count_activity: '$email_count',
            },
          },
          count: { $sum: '$email_count' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          user_activity_count: { $size: '$log' },
          count_all_activity: '$count',
          user_activity: '$log',
        },
      },
      {
        $sort: { date: 1 },
      },
    ]).exec();
    return GetCount;
  }

  async UserActivitySize(day: number): Promise<Object> {
    const DayNameIndoArray = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];
    const DayNameEnglishArray = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    if (day == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    var TODAY = new Date();
    var TODAY_BEFORE = new Date(new Date().setDate(new Date().getDate() - day));
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
          today: { $toDate: { $substrCP: [TODAY, 0, 10] } },
          today_before: { $toDate: { $substrCP: [TODAY_BEFORE, 0, 10] } },
        },
      },
      {
        $match: {
          createdAt_: { $gte: TODAY_BEFORE, $lt: TODAY },
          eventType: {
            $in: ['LIKE', 'VIEW', 'CREATE_POST', 'COMMENT', 'REACTION', 'POST'],
          },
        },
      },
      {
        $sort: { createdAt_: 1 },
      },
      {
        $group: {
          _id: {
            createdAt_data: '$createdAt_date_only',
            eventType_group: '$eventType',
          },
          eventType_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.createdAt_data',
          log: {
            $push: {
              eventType: '$_id.eventType_group',
              count_eventType: '$eventType_count',
            },
          },
          count: { $sum: '$eventType_count' },
        },
      },
      {
        $project: {
          _id: 0,
          day_name: {
            $arrayElemAt: [
              DayNameEnglishArray,
              {
                $subtract: [{ $toInt: { $dayOfWeek: { $toDate: '$_id' } } }, 1],
              },
            ],
          },
          date: '$_id',
          count_all_event: '$count',
          eventType_activity: '$log',
        },
      },
      {
        $sort: { date: 1 },
      },
    ]).exec();
    return GetCount;
  }

  async UserActivitySizeYear(year: number): Promise<Object> {
    var currentTime = new Date();
    var year_param = 0;
    if (year != undefined) {
      year_param = year;
    } else {
      year_param = currentTime.getFullYear();
    }
    const monthsArray = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
          YearcreatedAt: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
          year_param: { $toInt: year_param.toString() },
        },
      },
      {
        $match: {
          YearcreatedAt: year_param,
          eventType: {
            $in: ['LIKE', 'VIEW', 'CREATE_POST', 'COMMENT', 'REACTION', 'POST'],
          },
        },
      },
      {
        $group: {
          _id: {
            year_month: { $substrCP: ['$createdAt', 0, 7] },
            eventType_group: '$eventType',
          },
          eventType_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.year_month',
          log: {
            $push: {
              eventType: '$_id.eventType_group',
              count_eventType: '$eventType_count',
            },
          },
          count: { $sum: '$eventType_count' },
        },
      },
      {
        $project: {
          _id: 0,
          year: { $toInt: { $substrCP: ['$_id', 0, 4] } },
          month_int: { $toInt: { $substrCP: ['$_id', 5, 2] } },
          month_name: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [{ $toInt: { $substrCP: ['$_id', 5, 2] } }, 1],
              },
            ],
          },
          count_all_event: '$count',
          eventType_activity: '$log',
        },
      },
      {
        $sort: { month_int: 1 },
      },
    ]).exec();
    return GetCount;
  }

  async findcontent() {
    const query = await this.ContenteventsModel.aggregate([

      {
        $lookup: {
          from: 'contentevents',
          localField: 'contentevents.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'contentevents2'
        }
      },

    ]);
    return query;
  }

  async friend(email: string, head: any) {
    const query = await this.ContenteventsModel.aggregate([
      {
        "$match": {
          "$or": [
            {
              "eventType": "FOLLOWER"
            },
            {
              "eventType": "FOLLOWING"
            }
          ]
        }
      },
      {
        "$redact": {
          "$cond": [
            {
              "$eq": [
                "$senderParty",
                "$receiveParty"
              ]
            },
            "$$KEEP",
            "$$PRUNE"
          ]
        }
      },
      {
        "$match": {
          "event": "ACCEPT"
        }
      },
      {
        "$match": {
          "email": email
        }
      },
      {
        "$group": {
          "_id": "$receiverParty",
        }
      },
      {
        $project: {
          _id: 0,
          friend: '$_id',
        },
      },
    ]);
    return query;
  }
  async friendnew(email: string) {
    const query = await this.ContenteventsModel.aggregate([
      {
        "$match": {
          "$or": [
            {
              "$and": [
                {
                  "eventType": "FOLLOWING"
                },
                {
                  "senderParty": email
                }
              ]
            },
            {
              "$and": [
                {
                  "eventType": "FOLLOWER"
                },
                {
                  "receiverParty": email
                }
              ]
            }
          ]
        }
      },
      {
        "$lookup": {
          from: "userauths",
          localField: "email",
          foreignField: "email",
          as: "nameUser"
        }
      },
      {
        "$lookup": {
          from: "userbasics",
          localField: "email",
          foreignField: "email",
          as: "userBasic"
        }
      },
      {
        "$lookup": {
          from: "posts",
          as: "posted",
          let: { local_id: '$email' },
          pipeline: [
            { $match: { $expr: { $eq: ['$$local_id', '$email'] } } },
            {
              $sort: {
                'createdAt': - 1
              }
            },
            {
              $limit: 100
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "mediapicts",
          as: "pict",
          let: { local_id: '$posted.postID' },
          pipeline: [
            { $match: { $expr: { $in: ['$postID', '$$local_id'] } } },
            {
              $sort: {
                'createdAt': - 1
              }
            },
            {
              $limit: 10
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "mediadiaries",

          as: "diary",
          let: { local_id: '$posted.postID' },
          pipeline: [
            { $match: { $expr: { $in: ['$postID', '$$local_id'] } } },
            {
              $sort: {
                'createdAt': - 1
              }
            },
            {
              $limit: 10
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "mediavideos",

          as: "video",
          let: { local_id: '$posted.postID' },
          pipeline: [
            { $match: { $expr: { $in: ['$postID', '$$local_id'] } } },
            {
              $sort: {
                'createdAt': - 1
              }
            },
            {
              $limit: 10
            }
          ],


        }
      },
      {
        "$lookup": {
          from: "mediastories",
          localField: "posted.contentMedias.$id",
          foreignField: "_id",
          as: "stories",


        }
      },
      {
        "$lookup": {
          from: "mediaprofilepicts",
          localField: "userBasic.profilePict.$id",
          foreignField: "_id",
          as: "profilePict"
        }
      },
      {
        "$lookup": {
          from: "mediaproofpicts",
          localField: "userBasic.proofPict.$id",
          foreignField: "_id",
          as: "proofPict"
        }
      },
      {
        "$group": {
          "_id": {
            "friend": "$email",
            "username": "$nameUser.username",
            "profilePict": "$userBasic.profilePict",
            "proofPict": "$userBasic.proofPict",
            "profileSourceUri": "$profilePict.fsSourceUri",
            "proofSourceUri": "$proofPict.fsSourceUri",
            "posted": "$posted",
            "postPict": "$pict",
            "postDiary": "$diary",
            "postStories": "$stories",
            "postVid": "$video",
            //"postMeta":"$posted.metadata",
            //"postSaleAmount":"$posted.saleAmount",
            //"postLike":"$posted.like",
            //"postView":"$posted.view",
            //"postShare":"$posted.share",
          },
          "count": {
            "$sum": 1.0
          }
        }
      },
      {
        "$match": {
          "count": {
            "$gt": 1.0
          }
        }
      },
      {
        "$project": {
          "email": 1.0
        }
      }
    ],
      {
        "allowDiskUse": true
      }
    );
    return query;
  }
  async ceckFriendFollowingFollower(email1: string, email2: string) {
    const query = await this.ContenteventsModel.aggregate([
      {
        "$match": {
          "$or": [
            {
              "$and": [
                {
                  "eventType": "FOLLOWER"
                },
                {
                  "receiverParty": email2
                },
                {
                  "email": email1
                },
                {
                  "event": "ACCEPT"
                }
              ]
            },
            {
              "$and": [
                {
                  "eventType": "FOLLOWING"
                },
                {
                  "senderParty": email1
                },
                {
                  "email": email2
                },
                {
                  "event": "ACCEPT"
                }
              ]
            }
          ],
        }
      }
    ]);
    return query;
  }

  async findByCriteria(email: string, PostID: string, EventType: string, Events: string[], pageRow: number, pageNumber: number): Promise<Contentevents[]> {
    var Where = {}
    var Or = []
    Object.assign(Where, { email: email });
    if (PostID != "") {
      Object.assign(Where, { postID: PostID });
    }
    if (EventType != "") {
      Object.assign(Where, { eventType: EventType });
    }
    Object.assign(Where, { event: "ACCEPT" });
    Object.assign(Where, { active: true });
    // if (Events.length > 0) {
    //   for (let i = 0; i < Events.length; i++) {
    //     if (Events[i] == "INITIAL") {
    //       Or.push({ event: Events[i] }, { $and: [{ flowIsDone: false }] })
    //     } else if (Events[i] == "REQUEST") {
    //       Or.push({ event: Events[i] }, { $and: [{ flowIsDone: false }] })
    //     } else {
    //       Or.push({ event: Events[i] }, { $and: [{ flowIsDone: true }] })
    //     }
    //   }
    // }
    if (Object.keys(Or).length > 0) {
      Object.assign(Where, { $or: Or });
    } else {
      Object.assign(Where);
    }

    var sort = null;
    if (EventType != "") {
      if (EventType == "FOLLOWING" || EventType == "FOLLOWER") {
        sort = { sequenceNumber: 1, updatedAt: -1 }
      } else {
        sort = { postType: 1, updatedAt: -1 }
      }
    } else {
      sort = { postType: 1, updatedAt: -1 }
    }
    const query = this.ContenteventsModel.find(Where)
      .limit(pageRow)
      .skip(pageRow * pageNumber).sort(sort);
    return query;
  }

  async findfriend(email: string) {

    let query = await this.ContenteventsModel.aggregate(

      [
        {
          "$match": {
            "$or": [
              {
                "$and": [
                  {
                    "eventType": "FOLLOWING"
                  },
                  {
                    "senderParty": email
                  }
                ]
              },
              {
                "$and": [
                  {
                    "eventType": "FOLLOWER"
                  },
                  {
                    "receiverParty": email
                  }
                ]
              }
            ]
          }
        },
        {
          "$lookup": {
            from: "userauths",
            localField: "email",
            foreignField: "email",
            as: "nameUser"
          }
        },
        {
          "$lookup": {
            from: "userbasics",
            localField: "email",
            foreignField: "email",
            as: "userBasic"
          }
        },



        {
          "$group": {
            "_id": {
              "friend": "$email",
              "username": "$nameUser.username",

            },
            "count": {
              "$sum": 1.0
            }
          }
        },
        {
          "$match": {
            "count": {
              "$gt": 1.0
            }
          }
        },
        {
          "$project": {
            "email": 1.0
          }
        }
      ],
      {
        "allowDiskUse": true
      }
    );

    return query;
  }

  async ceckData(email: String, eventType: String, event: String, receiverParty: String, senderParty: String, postID: String): Promise<Contentevents> {
    let query = this.ContenteventsModel.findOne();
    query.where('email', email);
    query.where('eventType', eventType);
    query.where('event', event);
    if (senderParty != "") {
      query.where('senderParty', senderParty);
    }
    if (receiverParty != "") {
      query.where('receiverParty', receiverParty);
    }
    if (postID != "") {
      query.where('postID', postID);
    }
    return query.exec();
  }

  async findEventByEmail(email: string, postID: string[], eventInsight: string): Promise<Contentevents[]> {
    return this.ContenteventsModel.find().where('email', email).where('postID').in(postID).where('eventType', eventInsight).where('active', true).where('event', 'DONE').exec();
  }

  async updateUnlike(email: string, eventType: string, event: string, postID: string, active: boolean) {
    this.ContenteventsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        postID: postID,
        event: event,
      },
      { active: active },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollowing(email: string, eventType: string, receiverParty: string) {
    this.ContenteventsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        senderParty: receiverParty,
        event: "ACCEPT"
      },
      { active: false },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateFollowing(email: string, eventType: string, receiverParty: string) {
    this.ContenteventsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        senderParty: receiverParty,
        event: "ACCEPT"
      },
      { active: true },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateFollower(email: string, eventType: string, receiverParty: string) {
    this.ContenteventsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        receiverParty: receiverParty,
        event: "ACCEPT"
      },
      { active: true },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollower(email: string, eventType: string, receiverParty: string) {
    this.ContenteventsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        receiverParty: receiverParty,
        event: "ACCEPT"
      },
      { active: false },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async findkunjunganprofile(email: string, startdate: string, enddate: string) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var pipeline = [];
    pipeline.push({
      $match: {

        eventType: "VIEW_PROFILE",
        senderParty: email
      }
    },);

    if (startdate && startdate !== undefined) {
      pipeline.push({
        $match: {
          createdAt: { $gte: startdate }

        }
      },);
    }

    if (enddate && enddate !== undefined) {
      pipeline.push({
        $match: {
          createdAt: { $lte: dateend }

        }
      },);
    }

    pipeline.push(
      {
        $group: {
          _id: null,
          total: {
            $sum: 1
          }
        }
      });


    const query = await this.ContenteventsModel.aggregate(pipeline);
    return query;
  }
  async detailkunjunganprofile(email: string, startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var pipeline = [];
    pipeline.push({
      $match: {

        eventType: "VIEW_PROFILE",
        senderParty: email
      }
    },);

    if (startdate && startdate !== undefined) {
      pipeline.push({
        $match: {
          createdAt: { $gte: startdate }

        }
      },);
    }

    if (enddate && enddate !== undefined) {
      pipeline.push({
        $match: {
          createdAt: { $lte: dateend }

        }
      },);
    }

    pipeline.push({
      $group: {
        _id: {
          tanggal: {
            $substrCP: [
              "$createdAt",
              0,
              10
            ]
          }
        },
        total: {
          $sum: 1
        }
      }
    }, {
      $project: {
        _id: 0,
        date: "$_id.tanggal",
        total: 1,

      }
    }, {
      $sort: {
        date: 1
      }
    },);

    let query = await this.ContenteventsModel.aggregate(pipeline);
    return query;
  }

  public buildQueryFollowing(profile: Userbasic, vis: string, stoday: string, skip: number, row: number) {
    return this.ContenteventsModel.aggregate(

      [

        {
          $set: {
            "storyDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), - 61200000]
                }
              }
            }
          }
        },
        {
          $match:
          {
            $and: [
              {
                "eventType": "FOLLOWING"
              },
              {
                "email": profile.email
              },
              {
                "active": true
              },
              //{
              //    "receiverParty": {
              //        $ne: null
              //    }
              //},
              //{
              //    "receiverParty": {
              //        $ne: ""
              //    }
              //},
            ]
          }
        },
        {
          $sort: {
            "createdAt": - 1
          }
        },
        {
          $project: {
            "senderParty": 1,

          }
        },
        {
          $facet: {
            "following": [
              {
                $project: {
                  "receiver": "$senderParty",
                }
              },
            ],

            //pict
            "pict": [
              {
                $sort: {
                  "createdAt": - 1
                }
              },
              {
                "$lookup": {
                  from: "posts",
                  as: "post",
                  let: {
                    localID: '$senderParty'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ['$email', '$$localID']
                            }
                          },
                          {
                            $or: [
                              {
                                "reportedStatus": "ALL"
                              },
                              {
                                "reportedStatus": null
                              },

                            ]
                          },
                          {
                            "visibility": "PUBLIC"
                          },
                          {
                            "active": true
                          },
                          {
                            "postType": "pict"
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      }
                    },
                    {
                      $sort: {
                        "createdAt": - 1
                      }
                    },

                  ],

                },

              },
              {
                $unwind: {
                  path: "$post",

                }
              },
              {
                "$lookup": {
                  from: "mediapicts",
                  as: "media",
                  let: {
                    localID: '$post.postID'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$postID', '$$localID']
                        }
                      }
                    },
                    {
                      $sort: {
                        "createdAt": - 1
                      }
                    },
                    {
                      $project: {

                        "apsara": 1,
                        "apsaraId": 1,
                        "apsaraThumbId": 1,
                        "mediaEndpoint": 1,
                        "mediaUri": 1,
                        "mediaThumbEndpoint": 1,
                        "mediaThumbUri": 1,
                        "mediaType": 1

                      }
                    }
                  ],

                },

              },
              {
                "$lookup": {
                  from: "interests_repo",
                  as: "cats",
                  let: {
                    localID: '$post.category.$id'
                  },
                  pipeline: [
                    {
                      $match: {

                        $expr: {
                          $and: [
                            {
                              $in: ['$_id', {
                                $ifNull: ['$$localID', []]
                              }]
                            },

                          ]
                        }
                      }
                    },
                    {
                      $project: {
                        "interestName": 1,
                        "langIso": 1,
                        "icon": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                      }
                    }
                  ],

                }
              },

              {
                "$lookup": {
                  from: "userauths",
                  as: "userTag",
                  let: {
                    localID: '$post.tagPeople.$id'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {

                          $in: ['$_id', {
                            $ifNull: ['$$localID', []]
                          }]
                        }
                      }
                    },
                    {
                      $project: {

                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "username",
                  let: {
                    localID: '$post.email'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {

                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                "$lookup": {
                  from: "userbasics",
                  as: "userBasic",
                  let: {
                    localID: '$post.email'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "fullName": 1,
                        "profilePict": 1,
                        "isCelebrity": 1,
                        "isIdVerified": 1,
                        "isPrivate": 1,

                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userBasic",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                "$lookup": {
                  from: "mediaprofilepicts",
                  as: "avatar",
                  let: {
                    localID: '$userBasic.profilePict.$id'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$mediaID', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "mediaBasePath": 1,
                        "mediaUri": 1,
                        "originalName": 1,
                        "fsSourceUri": 1,
                        "fsSourceName": 1,
                        "fsTargetUri": 1,
                        "mediaType": 1,
                        "mediaEndpoint": {
                          "$concat": ["/profilepict/", "$_id"]
                        }
                      }
                    }
                  ],

                }
              },
              {
                $skip: skip
              },
              {
                $limit: row
              },
              {
                $unwind: {
                  path: "$media",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$username",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                "$lookup": {
                  from: "contentevents",
                  as: "isLike",
                  let: {
                    localID: '$post.postID'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ['$postID', '$$localID']
                            }
                          },
                          {
                            "email": profile.email
                          },
                          {
                            "eventType": "LIKE"
                          }
                        ]
                      }
                    },
                    {
                      $project: {
                        "email": 1,

                      }
                    }
                  ],

                }
              },
              {
                $project: {
                  "isLike": "$isLike",
                  "tagPeople": "$userTag",
                  "mediaType": "$media.mediaType",
                  "email": "$post.email",
                  "postType": "$post.postType",
                  "description": "$post.description",
                  "active": "$post.active",
                  "createdAt": "$post.createdAt",
                  "updatedAt": "$post.updatedAt",
                  "expiration": "$post.expiration",
                  "visibility": "$post.visibility",
                  "location": "$post.location",
                  "tags": 1,
                  "allowComments": "$post.allowComments",
                  "isSafe": "$post.isSafe",
                  "postID": "$post.postID",
                  "isOwned": "$post.isOwned",
                  "certified": "$post.certified",
                  "saleAmount": "$post.saleAmount",
                  "saleLike": "$post.saleLike",
                  "isShared": "$post.isShared",
                  "saleView": "$post.saleView",
                  "likes": "$post.likes",
                  "views": "$post.views",
                  "shares": "$post.shares",
                  "userProfile": "$post.userProfile",
                  "contentMedias": "$post.contentMedias",
                  "category": "$cats",
                  "tagDescription": "$post.tagDescription",
                  "metadata": "$post.metadata",
                  "isBoost": "$post.isBoost",
                  "boostCount": "$post.boostCount",
                  "contentModeration": "$post.contentModeration",
                  "reportedStatus": "$post.reportedStatus",
                  "reportedUserCount": "$post.reportedUserCount",
                  "contentModerationResponse": "$post.views",
                  "reportedUser": "$post.reportedUser",
                  "apsara": "$media.apsara",
                  "apsaraId": "$media.apsaraId",
                  "apsaraThumbId": "$media.apsaraThumbId",
                  "mediaEndpoint": "$media.mediaEndpoint",
                  "mediaUri": "$media.mediaUri",
                  "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                  "mediaThumbUri": "$media.mediaThumbUri",

                  "insight": [
                    {
                      "likes": "$post.likes",
                      "views": "$post.views",
                      "shares": "$post.shares",
                      "comments": "$post.comments",
                    }
                  ],
                  "fullName": "$userBasic.fullName",
                  "username": "$username.username",
                  "avatar": 1,
                  "privacy": [{
                    "isCelebrity": "$userBasic.isCelebrity"
                  }, {
                    "isIdVerified": "$userBasic.isIdVerified"
                  }, {
                    "isPrivate": "$userBasic.isPrivate"
                  }]
                },

              },
              {
                $sort: {
                  "createdAt": - 1
                }
              },

            ],
            //vid
            "video": [
              {
                $sort: {
                  "createdAt": - 1
                }
              },
              {
                "$lookup": {
                  from: "posts",
                  as: "post",
                  let: {
                    localID: '$senderParty'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ['$email', '$$localID']
                            }
                          },
                          {
                            $or: [
                              {
                                "reportedStatus": "ALL"
                              },
                              {
                                "reportedStatus": null
                              },

                            ]
                          },
                          {
                            "visibility": "PUBLIC"
                          },
                          {
                            "active": true
                          },
                          {
                            "postType": "vid"
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      }
                    },

                    {
                      $sort: {
                        "createdAt": - 1
                      }
                    },
                  ],

                },

              },
              {
                $unwind: {
                  path: "$post",

                }
              },
              {
                "$lookup": {
                  from: "mediavideos",
                  as: "media",
                  let: {
                    localID: '$post.postID'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$postID', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {

                        "apsara": 1,
                        "apsaraId": 1,
                        "apsaraThumbId": 1,
                        "mediaEndpoint": 1,
                        "mediaUri": 1,
                        "mediaThumbEndpoint": 1,
                        "mediaThumbUri": 1,
                        "mediaType": 1


                      }
                    }
                  ],

                },

              },
              {
                "$lookup": {
                  from: "interests_repo",
                  as: "cats",
                  let: {
                    localID: '$post.category.$id'
                  },
                  pipeline: [
                    {
                      $match: {

                        $expr: {
                          $and: [
                            {
                              $in: ['$_id', {
                                $ifNull: ['$$localID', []]
                              }]
                            },

                          ]
                        }
                      }
                    },
                    {
                      $project: {
                        "interestName": 1,
                        "langIso": 1,
                        "icon": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                      }
                    }
                  ],

                }
              },

              {
                "$lookup": {
                  from: "userauths",
                  as: "userTag",
                  let: {
                    localID: '$post.tagPeople.$id'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $in: ['$_id', {
                            $ifNull: ['$$localID', []]
                          }]
                        }
                      }
                    },
                    {
                      $project: {

                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "username",
                  let: {
                    localID: '$post.email'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {

                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                "$lookup": {
                  from: "userbasics",
                  as: "userBasic",
                  let: {
                    localID: '$post.email'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "fullName": 1,
                        "profilePict": 1,
                        "isCelebrity": 1,
                        "isIdVerified": 1,
                        "isPrivate": 1,

                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userBasic",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                "$lookup": {
                  from: "mediaprofilepicts",
                  as: "avatar",
                  let: {
                    localID: '$userBasic.profilePict.$id'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$mediaID', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "mediaBasePath": 1,
                        "mediaUri": 1,
                        "originalName": 1,
                        "fsSourceUri": 1,
                        "fsSourceName": 1,
                        "fsTargetUri": 1,
                        "mediaType": 1,
                        "mediaEndpoint": {
                          "$concat": ["/profilepict/", "$_id"]
                        }

                      }
                    }
                  ],

                }
              },
              {
                $skip: skip
              },
              {
                $limit: row
              },
              {
                $unwind: {
                  path: "$media",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$username",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                "$lookup": {
                  from: "contentevents",
                  as: "isLike",
                  let: {
                    localID: '$post.postID'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ['$postID', '$$localID']
                            }
                          },
                          {
                            "email": profile.email
                          },
                          {
                            "eventType": "LIKE"
                          }
                        ]
                      }
                    },
                    {
                      $project: {
                        "email": 1,

                      }
                    }
                  ],

                }
              },
              {
                $project: {

                  "postID": "$post.postID",
                  "isLike": "$isLike",
                  "tagPeople": "$userTag",
                  "mediaType": "$media.mediaType",
                  "email": "$post.email",
                  "postType": "$post.postType",
                  "description": "$post.description",
                  "active": "$post.active",
                  "createdAt": "$post.createdAt",
                  "updatedAt": "$post.updatedAt",
                  "expiration": "$post.expiration",
                  "visibility": "$post.visibility",
                  "location": "$post.location",
                  "tags": 1,
                  "allowComments": "$post.allowComments",
                  "isSafe": "$post.isSafe",
                  "isOwned": "$post.isOwned",
                  "certified": "$post.certified",
                  "saleAmount": "$post.saleAmount",
                  "saleLike": "$post.saleLike",
                  "saleView": "$post.saleView",
                  "isShared": "$post.isShared",
                  "likes": "$post.likes",
                  "views": "$post.views",
                  "shares": "$post.shares",
                  "userProfile": "$post.userProfile",
                  "contentMedias": "$post.contentMedias",
                  "category": "$cats",
                  "tagDescription": "$post.tagDescription",
                  "metadata": "$post.metadata",
                  "isBoost": "$post.isBoost",
                  "boostCount": "$post.boostCount",
                  "contentModeration": "$post.contentModeration",
                  "reportedStatus": "$post.reportedStatus",
                  "reportedUserCount": "$post.reportedUserCount",
                  "contentModerationResponse": "$post.views",
                  "reportedUser": "$post.reportedUser",
                  "apsara": "$media.apsara",
                  "apsaraId": "$media.apsaraId",
                  "apsaraThumbId": "$media.apsaraThumbId",
                  "mediaEndpoint": "$media.mediaEndpoint",
                  "mediaUri": "$media.mediaUri",
                  "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                  "mediaThumbUri": "$media.mediaThumbUri",
                  "insight": [
                    {
                      "likes": "$post.likes",
                      "views": "$post.views",
                      "shares": "$post.shares",
                      "comments": "$post.comments",
                    }
                  ],
                  "fullName": "$userBasic.fullName",
                  "username": "$username.username",
                  "avatar": 1,
                  "privacy": [{
                    "isCelebrity": "$userBasic.isCelebrity"
                  }, {
                    "isIdVerified": "$userBasic.isIdVerified"
                  }, {
                    "isPrivate": "$userBasic.isPrivate"
                  }]
                },

              }
            ],
            //diary
            "diary": [
              {
                $sort: {
                  "createdAt": - 1
                }
              },
              {
                "$lookup": {
                  from: "posts",
                  as: "post",
                  let: {
                    localID: '$senderParty'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ['$email', '$$localID']
                            }
                          },
                          {
                            $or: [
                              {
                                "reportedStatus": "ALL"
                              },
                              {
                                "reportedStatus": null
                              },

                            ]
                          },
                          {
                            "visibility": "PUBLIC"
                          },
                          {
                            "active": true
                          },
                          {
                            "postType": "diary"
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      }
                    },

                    {
                      $sort: {
                        "createdAt": - 1
                      }
                    },
                  ],

                },

              },
              {
                $unwind: {
                  path: "$post",

                }
              },
              {
                "$lookup": {
                  from: "mediadiaries",
                  as: "media",
                  let: {
                    localID: '$post.postID'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$postID', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {

                        "apsara": 1,
                        "apsaraId": 1,
                        "apsaraThumbId": 1,
                        "mediaEndpoint": 1,
                        "mediaUri": 1,
                        "mediaThumbEndpoint": 1,
                        "mediaThumbUri": 1,
                        "mediaType": 1


                      }
                    }
                  ],

                },

              },
              {
                "$lookup": {
                  from: "interests_repo",
                  as: "cats",
                  let: {
                    localID: '$post.category.$id'
                  },
                  pipeline: [
                    {
                      $match: {

                        $expr: {
                          $and: [
                            {
                              $in: ['$_id', {
                                $ifNull: ['$$localID', []]
                              }]
                            },

                          ]
                        }
                      }
                    },
                    {
                      $project: {
                        "interestName": 1,
                        "langIso": 1,
                        "icon": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                      }
                    }
                  ],

                }
              },

              {
                "$lookup": {
                  from: "userauths",
                  as: "userTag",
                  let: {
                    localID: '$post.tagPeople.$id'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $in: ['$_id', {
                            $ifNull: ['$$localID', []]
                          }]
                        }
                      }
                    },
                    {
                      $project: {

                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "username",
                  let: {
                    localID: '$post.email'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {

                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                "$lookup": {
                  from: "userbasics",
                  as: "userBasic",
                  let: {
                    localID: '$post.email'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "fullName": 1,
                        "profilePict": 1,
                        "isCelebrity": 1,
                        "isIdVerified": 1,
                        "isPrivate": 1,

                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userBasic",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                "$lookup": {
                  from: "mediaprofilepicts",
                  as: "avatar",
                  let: {
                    localID: '$userBasic.profilePict.$id'
                  },
                  pipeline: [
                    {
                      $match:
                      {


                        $expr: {
                          $eq: ['$mediaID', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "mediaBasePath": 1,
                        "mediaUri": 1,
                        "originalName": 1,
                        "fsSourceUri": 1,
                        "fsSourceName": 1,
                        "fsTargetUri": 1,
                        "mediaType": 1,
                        "mediaEndpoint": {
                          "$concat": ["/profilepict/", "$_id"]
                        }

                      }
                    }
                  ],

                }
              },
              {
                $skip: skip
              },
              {
                $limit: row
              },
              {
                $unwind: {
                  path: "$media",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$username",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                "$lookup": {
                  from: "contentevents",
                  as: "isLike",
                  let: {
                    localID: '$post.postID'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ['$postID', '$$localID']
                            }
                          },
                          {
                            "email": profile.email
                          },
                          {
                            "eventType": "LIKE"
                          }
                        ]
                      }
                    },
                    {
                      $project: {
                        "email": 1,

                      }
                    }
                  ],

                }
              },
              {
                $project: {

                  "postID": "$post.postID",
                  "isLike": "$isLike",
                  "tagPeople": "$userTag",
                  "mediaType": "$media.mediaType",
                  "email": "$post.email",
                  "postType": "$post.postType",
                  "description": "$post.description",
                  "active": "$post.active",
                  "createdAt": "$post.createdAt",
                  "updatedAt": "$post.updatedAt",
                  "expiration": "$post.expiration",
                  "visibility": "$post.visibility",
                  "location": "$post.location",
                  "tags": 1,
                  "allowComments": "$post.allowComments",
                  "isSafe": "$post.isSafe",
                  "isOwned": "$post.isOwned",
                  "certified": "$post.certified",
                  "saleAmount": "$post.saleAmount",
                  "saleLike": "$post.saleLike",
                  "saleView": "$post.saleView",
                  "isShared": "$post.isShared",
                  "likes": "$post.likes",
                  "views": "$post.views",
                  "shares": "$post.shares",
                  "userProfile": "$post.userProfile",
                  "contentMedias": "$post.contentMedias",
                  "category": "$cats",
                  "tagDescription": "$post.tagDescription",
                  "metadata": "$post.metadata",
                  "isBoost": "$post.isBoost",
                  "boostCount": "$post.boostCount",
                  "contentModeration": "$post.contentModeration",
                  "reportedStatus": "$post.reportedStatus",
                  "reportedUserCount": "$post.reportedUserCount",
                  "contentModerationResponse": "$post.views",
                  "reportedUser": "$post.reportedUser",
                  "apsara": "$media.apsara",
                  "apsaraId": "$media.apsaraId",
                  "apsaraThumbId": "$media.apsaraThumbId",
                  "mediaEndpoint": "$media.mediaEndpoint",
                  "mediaUri": "$media.mediaUri",
                  "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                  "mediaThumbUri": "$media.mediaThumbUri",
                  "insight": [
                    {
                      "likes": "$post.likes",
                      "views": "$post.views",
                      "shares": "$post.shares",
                      "comments": "$post.comments",
                    }
                  ],
                  "fullName": "$userBasic.fullName",
                  "username": "$username.username",
                  "avatar": 1,
                  "privacy": [{
                    "isCelebrity": "$userBasic.isCelebrity"
                  }, {
                    "isIdVerified": "$userBasic.isIdVerified"
                  }, {
                    "isPrivate": "$userBasic.isPrivate"
                  }]
                },

              }
            ],
            //story
            // "story": [
            //   {
            //     $sort: {
            //       "createdAt": - 1
            //     }
            //   },
            //   {
            //     "$lookup": {
            //       from: "posts",
            //       as: "post",
            //       let: {
            //         localID: '$senderParty'
            //       },
            //       pipeline: [
            //         {
            //           $match:
            //           {
            //             $and: [
            //               {
            //                 $expr: {
            //                   $eq: ['$email', '$$localID']
            //                 }
            //               },
            //               {
            //                 $or: [
            //                   {
            //                     "reportedStatus": "ALL"
            //                   },
            //                   {
            //                     "reportedStatus": null
            //                   },

            //                 ]
            //               },
            //               {
            //                 "visibility": "PUBLIC"
            //               },
            //               {
            //                 "active": true
            //               },
            //               {
            //                 "postType": "story"
            //               },
            //               {
            //                 "reportedUser.email": {
            //                   $not: {
            //                     $regex: profile.email
            //                   }
            //                 }
            //               },
            //               {
            //                 $expr: {
            //                   $gte: ["$expiration", {
            //                     $toLong: {
            //                       $add: [new Date(), - 61200000]
            //                     }

            //                   }]
            //                 }
            //               },

            //             ]
            //           }
            //         },

            //         {
            //           $sort: {
            //             "createdAt": - 1
            //           }
            //         },
            //       ],

            //     },

            //   },
            //   {
            //     $unwind: {
            //       path: "$post",

            //     }
            //   },
            //   {
            //     "$lookup": {
            //       from: "mediastories",
            //       as: "media",
            //       let: {
            //         localID: '$post.postID'
            //       },
            //       pipeline: [
            //         {
            //           $match:
            //           {


            //             $expr: {
            //               $eq: ['$postID', '$$localID']
            //             }
            //           }
            //         },
            //         {
            //           $project: {

            //             "apsara": 1,
            //             "apsaraId": 1,
            //             "apsaraThumbId": 1,
            //             "mediaEndpoint": 1,
            //             "mediaUri": 1,
            //             "mediaThumbEndpoint": 1,
            //             "mediaThumbUri": 1,
            //             "mediaType": 1


            //           }
            //         }
            //       ],

            //     },

            //   },
            //   {
            //     "$lookup": {
            //       from: "interests_repo",
            //       as: "cats",
            //       let: {
            //         localID: '$post.category.$id'
            //       },
            //       pipeline: [
            //         {
            //           $match: {

            //             $expr: {
            //               $and: [
            //                 {
            //                   $in: ['$_id', {
            //                     $ifNull: ['$$localID', []]
            //                   }]
            //                 },

            //               ]
            //             }
            //           }
            //         },
            //         {
            //           $project: {
            //             "interestName": 1,
            //             "langIso": 1,
            //             "icon": 1,
            //             "createdAt": 1,
            //             "updatedAt": 1
            //           }
            //         }
            //       ],

            //     }
            //   },

            //   {
            //     "$lookup": {
            //       from: "userauths",
            //       as: "userTag",
            //       let: {
            //         localID: '$post.tagPeople.$id'
            //       },
            //       pipeline: [
            //         {
            //           $match:
            //           {


            //             $expr: {
            //               $in: ['$_id', {
            //                 $ifNull: ['$$localID', []]
            //               }]
            //             }
            //           }
            //         },
            //         {
            //           $project: {

            //             "username": 1
            //           }
            //         }
            //       ],

            //     }
            //   },
            //   {
            //     "$lookup": {
            //       from: "userauths",
            //       as: "username",
            //       let: {
            //         localID: '$post.email'
            //       },
            //       pipeline: [
            //         {
            //           $match:
            //           {


            //             $expr: {
            //               $eq: ['$email', '$$localID']
            //             }
            //           }
            //         },
            //         {
            //           $project: {

            //             "username": 1
            //           }
            //         }
            //       ],

            //     }
            //   },
            //   {
            //     "$lookup": {
            //       from: "userbasics",
            //       as: "userBasic",
            //       let: {
            //         localID: '$post.email'
            //       },
            //       pipeline: [
            //         {
            //           $match:
            //           {


            //             $expr: {
            //               $eq: ['$email', '$$localID']
            //             }
            //           }
            //         },
            //         {
            //           $project: {
            //             "fullName": 1,
            //             "profilePict": 1,
            //             "isCelebrity": 1,
            //             "isIdVerified": 1,
            //             "isPrivate": 1,

            //           }
            //         }
            //       ],

            //     }
            //   },
            //   {
            //     $unwind: {
            //       path: "$userBasic",
            //       preserveNullAndEmptyArrays: true
            //     }
            //   },
            //   {
            //     "$lookup": {
            //       from: "mediaprofilepicts",
            //       as: "avatar",
            //       let: {
            //         localID: '$userBasic.profilePict.$id'
            //       },
            //       pipeline: [
            //         {
            //           $match:
            //           {


            //             $expr: {
            //               $eq: ['$mediaID', '$$localID']
            //             }
            //           }
            //         },
            //         {
            //           $project: {
            //             "mediaBasePath": 1,
            //             "mediaUri": 1,
            //             "originalName": 1,
            //             "fsSourceUri": 1,
            //             "fsSourceName": 1,
            //             "fsTargetUri": 1,
            //             "mediaType": 1,
            //             "mediaEndpoint": {
            //               "$concat": ["/profilepict/", "$_id"]
            //             }

            //           }
            //         }
            //       ],

            //     }
            //   },
            //   {
            //     $skip: skip
            //   },
            //   {
            //     $limit: row
            //   },
            //   {
            //     $unwind: {
            //       path: "$media",
            //       preserveNullAndEmptyArrays: true
            //     }
            //   },
            //   {
            //     $unwind: {
            //       path: "$username",
            //       preserveNullAndEmptyArrays: true
            //     }
            //   },
            //   {
            //     "$lookup": {
            //       from: "contentevents",
            //       as: "isLike",
            //       let: {
            //         localID: '$post.postID'
            //       },
            //       pipeline: [
            //         {
            //           $match:
            //           {
            //             $and: [
            //               {
            //                 $expr: {
            //                   $eq: ['$postID', '$$localID']
            //                 }
            //               },
            //               {
            //                 "email": profile.email
            //               },
            //               {
            //                 "eventType": "LIKE"
            //               }
            //             ]
            //           }
            //         },
            //         {
            //           $project: {
            //             "email": 1,

            //           }
            //         }
            //       ],

            //     }
            //   },
            //   {
            //     $project: {
            //       "postID": "$post.postID",
            //       "isLike": "$isLike",
            //       "tagPeople": "$userTag",
            //       "mediaType": "$media.mediaType",
            //       "email": "$post.email",
            //       "postType": "$post.postType",
            //       "description": "$post.description",
            //       "active": "$post.active",
            //       "createdAt": "$post.createdAt",
            //       "updatedAt": "$post.updatedAt",
            //       "expiration": "$post.expiration",
            //       "visibility": "$post.visibility",
            //       "location": "$post.location",
            //       "tags": 1,
            //       "allowComments": "$post.allowComments",
            //       "isSafe": "$post.isSafe",
            //       "isOwned": "$post.isOwned",
            //       "certified": "$post.certified",
            //       "saleAmount": "$post.saleAmount",
            //       "saleLike": "$post.saleLike",
            //       "isShared": "$post.isShared",
            //       "saleView": "$post.saleView",
            //       "likes": "$post.likes",
            //       "views": "$post.views",
            //       "shares": "$post.shares",
            //       "userProfile": "$post.userProfile",
            //       "contentMedias": "$post.contentMedias",
            //       "category": "$cats",
            //       "tagDescription": "$post.tagDescription",
            //       "metadata": "$post.metadata",
            //       "isBoost": "$post.isBoost",
            //       "boostCount": "$post.boostCount",
            //       "contentModeration": "$post.contentModeration",
            //       "reportedStatus": "$post.reportedStatus",
            //       "reportedUserCount": "$post.reportedUserCount",
            //       "contentModerationResponse": "$post.views",
            //       "reportedUser": "$post.reportedUser",
            //       "apsara": "$media.apsara",
            //       "apsaraId": "$media.apsaraId",
            //       "apsaraThumbId": "$media.apsaraThumbId",
            //       "mediaEndpoint": "$media.mediaEndpoint",
            //       "mediaUri": "$media.mediaUri",
            //       "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
            //       "mediaThumbUri": "$media.mediaThumbUri",
            //       "insight": [
            //         {
            //           "likes": "$post.likes",
            //           "views": "$post.views",
            //           "shares": "$post.shares",
            //           "comments": "$post.comments",
            //         }
            //       ],
            //       "fullName": "$userBasic.fullName",
            //       "username": "$username.username",
            //       "avatar": 1,
            //       "privacy": [{
            //         "isCelebrity": "$userBasic.isCelebrity"
            //       }, {
            //         "isIdVerified": "$userBasic.isIdVerified"
            //       }, {
            //         "isPrivate": "$userBasic.isPrivate"
            //       }]
            //     },

            //   }
            // ],

            //"test":[
            //	{
            //		$project:{
            //				"ded":"root",
            //			 "picts": '$pict.postID',
            //			"vids": '$video.postID',
            //			"diarys": '$diary.postID',
            //			"storys": '$story.postID',																					
            //		}
            //	}
            //]
          }
        },
        //{
        //						$project:{
        //								"following":"$following",
        //							 "pict": '$pict',
        //							"video": '$video',
        //							"diary": '$diary',
        //							"story": '$story',		
        //							picts: '$pict.postID',
        //            vids: '$video.postID',
        //            diarys: '$diary.postID',
        //            storys: '$story.postID',																			
        //						}
        //					},
        //{
        //    $unwind: {
        //        path: "$pict",
        //        preserveNullAndEmptyArrays: true
        //    }
        //},
        //{
        //    $unwind: {
        //        path: "$vid",
        //        preserveNullAndEmptyArrays: true
        //    }
        //},
        //{
        //    $unwind: {
        //        path: "$story",
        //        preserveNullAndEmptyArrays: true
        //    }
        //},
        //{
        //    $unwind: {
        //        path: "$diary",
        //        preserveNullAndEmptyArrays: true
        //    }
        //},
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$pict.postID',
              vids: '$video.postID',
              diarys: '$diary.postID',
              // storys: '$story.postID',

            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$picts']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$vids']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        },
                        {
                          "active": true
                        }
                      ]
                    },
                    // {
                    //   $and: [
                    //     {
                    //       $expr: {
                    //         $eq: ['$postID', '$$storys']
                    //       }
                    //     },
                    //     {
                    //       "email": profile.email
                    //     },
                    //     {
                    //       "eventType": "LIKE"
                    //     },
                    //     {
                    //       "active": true
                    //     }
                    //   ]
                    // },
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$diarys']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        },
                        {
                          "active": true
                        }
                      ]
                    },

                  ]
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,

                }
              }
            ],

          }
        },
        // {
        //   "$lookup": {
        //     from: "contentevents",
        //     as: "storyView",
        //     let: {
        //       picts: '$pict.postID',
        //       vids: '$video.postID',
        //       diarys: '$diary.postID',
        //      // storys: '$story.postID',

        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {
        //           $or: [

        //             {
        //               $and: [
        //                 {
        //                   $expr: {
        //                     $eq: ['$postID', '$$storys']
        //                   }
        //                 },
        //                 {
        //                   "email": profile.email
        //                 },
        //                 {
        //                   "eventType": "VIEW"
        //                 }
        //               ]
        //             },

        //           ]
        //         }
        //       },
        //       {
        //         $project: {
        //           "email": 1,
        //           "postID": 1,

        //         }
        //       }
        //     ],

        //   }
        // },
      ]


    ).exec();
  }

  public genderChartbyEmail(email: string) {
    let query = this.ContenteventsModel.aggregate([
      {
        $match: {
          eventType: "VIEW",
          event: "ACCEPT",
          active: true,
          email: email
        }
      },
      {
        "$lookup": {
          "from": "userbasics",
          "as": "ubasic",
          "let": {
            "local_id": "$senderParty"
          },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  "$eq": [
                    "$email",
                    "$$local_id"
                  ]
                }
              }
            },

          ],

        }
      },
      {
        $project: {
          ubasic: {
            $arrayElemAt: ['$ubasic', 0]
          },

        }
      },
      {
        $project: {

          gender: '$ubasic.gender',

        }
      },
      {
        $project: {

          gender: {

            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$gender', 'FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$gender', ' FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'Perempuan']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'Wanita']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$gender', ' MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'Laki-laki']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: ['$gender', 'Pria']
                  },
                  then: 'MALE',

                },

              ],
              default: "OTHER",

            },

          },

        }
      },

      {
        "$group": {
          "_id": "$gender",
          "count": {
            "$sum": 1
          }
        }
      }
    ]);

    return query;
  }

  async countLikeBoost(postID: string, startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dateend = "";
      dt = "";
    }
    var query = await this.ContenteventsModel.aggregate(
      [
        {
          $match: {
            postID: postID,
            eventType: "LIKE",
            event: "DONE",
            createdAt: {
              $gte: startdate,
              $lte: dt
            }
          }
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1
            },

          },

        },
      ]
    );

    return query;
  }
  async countCommentBoost(postID: string, startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dateend = "";
      dt = "";
    }
    var query = await this.ContenteventsModel.aggregate(
      [
        {
          $match: {
            postID: postID,
            eventType: "COMMENT",
            event: "DONE",
            createdAt: {
              $gte: startdate,
              $lte: dt
            }
          }
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1
            },

          },

        },
      ]
    );

    return query;
  }

  async getFollowerStoryByEmail(email: string) {
    var query = await this.ContenteventsModel.aggregate([
      {
        "$match":
        {
          "$and":
            [
              {
                "$expr":
                {
                  "$eq":
                    [
                      "$email", email
                    ]
                }
              },
              {
                "$expr":
                {
                  "$eq":
                    [
                      "$eventType", "FOLLOWING"
                    ]
                }
              },
              {
                "$expr":
                {
                  "$eq":
                    [
                      "$active", true
                    ]
                }
              },
              {
                "$expr":
                {
                  "$eq":
                    [
                      "$event", "ACCEPT"
                    ]
                }
              },
            ]
        },
      },
      {
        "$group":
        {
          _id: null,
          data:
          {
            "$push": "$senderParty"
          }
        }
      },
      {
        "$lookup":
        {
          from: 'posts',
          as: 'post_data',
          let:
          {
            post_fk: "$data"
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$or":
                    [
                      {
                        "$and":
                          [
                            {
                              "$expr":
                              {
                                "$eq": ["$email", email]
                              }
                            },
                            {
                              "$expr":
                              {
                                "$eq": ["$postType", "story"]
                              }
                            },
                          ]
                      },
                      {
                        "$and":
                          [
                            {
                              "$expr":
                              {
                                "$in": ["$email", "$$post_fk"]
                              }
                            },
                            {
                              "$expr":
                              {
                                "$eq": ["$postType", "story"]
                              }
                            },
                            {
                              "reportedStatus":
                              {
                                "$ne": "OWNED"
                              }
                            },
                            {
                              "visibility": "PUBLIC"
                            },
                            {
                              "active": true
                            },
                            {
                              "reportedUser.email":
                              {
                                "$not":
                                {
                                  "$regex": email
                                }
                              }
                            },
                          ]
                      }
                    ]
                },

              },
              {
                "$set": {
                  "settimeStart":
                  {
                    "$dateToString": {
                      "format": "%Y-%m-%d %H:%M:%S",
                      "date": {
                        $add: [new Date(), - 61200000] // 1 hari 61200000
                      }
                    }
                  }
                }
              },
              {
                "$set": {
                  "settimeEnd":
                  {
                    "$dateToString": {
                      "format": "%Y-%m-%d %H:%M:%S",
                      "date": {
                        $add: [new Date(), 25200000]
                      }
                    }
                  }
                }
              },
              {
                "$match":
                {
                  "$and":
                    [
                      {
                        "$expr":
                        {
                          "$gte": ["$createdAt", "$settimeStart"]
                        },
                      },
                      {
                        "$expr":
                        {
                          "$lte": ["$createdAt", "$settimeEnd"]
                        }
                      },
                    ]
                }
              },
              {
                "$sort":
                {
                  createdAt: -1
                }
              },
            ]
        }
      },
      {
        "$project":
        {
          post_data: 1,
        }
      },
      {
        "$unwind":
        {
          path: "$post_data",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup":
        {
          from: 'userauths',
          as: 'auth_data',
          let:
          {
            auth_fk: "$post_data.email"
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$expr":
                  {
                    "$eq":
                      [
                        "$email", "$$auth_fk"
                      ]
                  }
                }
              },
              {
                "$project":
                {
                  _id: 1,
                  username: 1
                }
              }
            ]
        }
      },
      {
        "$project":
        {
          _id: "$post_data.postID",
          username:
          {
            "$arrayElemAt":
              [
                "$auth_data.username", 0
              ]
          },
          postID: "$post_data.postID",
          email: "$post_data.email",
          postType: "$post_data.postType",
          description: "$post_data.description",
          active: "$post_data.active",
          createdAt: "$post_data.createdAt",
          updatedAt: "$post_data.updatedAt",
          expiration: "$post_data.expiration",
          visibility: "$post_data.visibility",
          location: "$post_data.location",
          allowComments: "$post_data.allowComments",
          isSafe: "$post_data.isSafe",
          isOwned: "$post_data.isOwned",
          saleLike: "$post_data.saleLike",
          saleView: "$post_data.saleView",
          metadata: "$post_data.metadata",
          insight: [
            {
              likes: "$post_data.likes",
              views: "$post_data.views",
              shares: "$post_data.shares",
            }
          ],
          userProfile: "$post_data.userProfile",
          contentMedias: "$post_data.contentMedias",
          musicId: "$post_data.musicId",
          statusCB: "$post_data.statusCB",
          reportedStatus: "$post_data.reportedStatus",
          reportedUser: "$post_data.reportedUser",
          contentModeration: "$post_data.contentModeration",
          contentModerationResponse: "$post_data.contentModerationResponse",
        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isLike",
          let: {
            storys: '$postID',

          },
          pipeline:
            [
              {
                $match:
                {
                  $and: [
                    {
                      $expr:
                      {
                        $eq: ['$postID', '$$storys']
                      }
                    },
                    {
                      "email": email,
                    },
                    {
                      "eventType": "LIKE"
                    },
                  ]
                },
              },
              {
                $project:
                {
                  "email": 1,
                  "postID": 1,
                }
              }
            ],

        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isViewed",
          let: {
            storys: '$postID',

          },
          pipeline:
            [
              {
                $match:
                {
                  $and: [
                    {
                      $expr:
                      {
                        $eq: ['$postID', '$$storys']
                      }
                    },
                    {
                      "email": email,
                    },
                    {
                      "eventType": "VIEW"
                    },
                  ]
                },
              },
              {
                $project:
                {
                  "email": 1,
                  "postID": 1,
                }
              }
            ],

        }
      },
      {
        "$lookup":
        {
          from: 'mediastories',
          as: 'mstory_data',
          let:
          {
            mstory_fk: "$postID"
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$and":
                    [
                      {
                        "$expr":
                        {
                          "$eq": ["$postID", "$$mstory_fk"]
                        }
                      },
                    ]
                }
              },
              {
                $project: {

                  "apsara": 1,
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaEndpoint": 1,
                  "mediaUri": 1,
                  "mediaThumbEndpoint": 1,
                  "mediaThumbUri": 1,
                  "mediaType": 1,

                }
              }
            ]
        }
      },
      {
        "$lookup":
        {
          from: "mediamusic",
          as: "music",
          let: {
            localID: '$musicId'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$_id', '$$localID']
                }
              }
            },
            {
              $project: {
                "musicTitle": 1,
                "artistName": 1,
                "albumName": 1,
                "apsaraMusic": 1,
                "apsaraThumnail": 1,
                "genre": "$genre.name",
                "theme": "$theme.name",
                "mood": "$mood.name",

              }
            }
          ],
        }
      },
      {
        "$lookup":
        {
          from: 'userbasics',
          as: 'basic_data',
          let:
          {
            basic_fk: "$email"
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$and":
                    [
                      {
                        "$expr":
                        {
                          "$eq":
                            [
                              "$email",
                              "$$basic_fk"
                            ]
                        },
                      },
                    ]
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                }
              }
            ]
        },
      },
      {
        "$unwind":
        {
          path: "$basic_data",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "mediaprofilepicts",
          as: "avatar",
          let: {
            localID: '$basic_data.profilePict.$id'
          },
          pipeline: [
            {
              $match:
              {


                $expr: {
                  $eq: ['$mediaID', '$$localID']
                }
              }
            },
            {
              $project: {
                "_id": 1,
                "mediaEndpoint": {
                  "$concat": ["/profilepict/", "$mediaID"]
                }
              }
            }
          ],

        }
      },
      {
        "$project":
        {
          fullName: "$basic_data.fullName",
          username: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          active: 1,
          createdAt: 1,
          updatedAt: 1,
          expiration: 1,
          visibility: 1,
          location: 1,
          allowComments: 1,
          isSafe: 1,
          isOwned: 1,
          saleLike: 1,
          saleView: 1,
          metadata: 1,
          insight: 1,
          userProfile: 1,
          contentMedias: 1,
          statusCB: 1,
          reportedStatus: 1,
          reportedUser: 1,
          reportedUserCount: 1,
          contentModeration: 1,
          contentModerationResponse: 1,
          apsara:
          {
            "$arrayElemAt":
              [
                "$mstory_data.apsara", 0
              ]
          },
          apsaraId:
          {
            "$arrayElemAt":
              [
                "$mstory_data.apsaraId", 0
              ]
          },
          apsaraThumbId:
          {
            "$arrayElemAt":
              [
                "$mstory_data.apsaraThumbId", 0
              ]
          },
          mediaType:
          {
            "$arrayElemAt":
              [
                "$mstory_data.mediaType", 0
              ]
          },
          musicTitle:
          {
            "$arrayElemAt":
              [
                "$music.musicTitle", 0
              ]
          },
          artistName:
          {
            "$arrayElemAt":
              [
                "$music.artistName", 0
              ]
          },
          albumName:
          {
            "$arrayElemAt":
              [
                "$music.albumName", 0
              ]
          },
          apsaraMusic:
          {
            "$arrayElemAt":
              [
                "$music.apsaraMusic", 0
              ]
          },
          apsaraThumnail:
          {
            "$arrayElemAt":
              [
                "$music.apsaraThumbnail", 0
              ]
          },
          genre:
          {
            "$arrayElemAt":
              [
                "$music.genre.name", 0
              ]
          },
          theme:
          {
            "$arrayElemAt":
              [
                "$music.theme.name", 0
              ]
          },
          mood:
          {
            "$arrayElemAt":
              [
                "$music.mood.name", 0
              ]
          },
          avatar: 1,
          privacy:
            [
              {
                "isCelebrity": "$basic_data.isCelebrity"
              },
              {
                "isIdVerified": "$basic_data.isIdVerified"
              },
              {
                "isPrivate": "$basic_data.isPrivate"
              }
            ],
          isViewed:
          {
            "$cond":
            {
              if:
              {
                "$gt":
                  [
                    {
                      "$size": "$isViewed"
                    },
                    0
                  ]
              },
              then: true,
              else: false
            }
          },
          isLike:
          {
            "$cond":
            {
              if:
              {
                "$gt":
                  [
                    {
                      "$size": "$isLike"
                    },
                    0
                  ]
              },
              then: true,
              else: false
            }
          },
        }
      },
      {
        "$group":
        {
          _id:
          {
            email: "$email",
            username: "$username"
          },
          newcreatedAt:
          {
            "$first": "$createdAt"
          },
          oldcreatedAt:
          {
            "$last": "$createdAt",
          },
          story:
          {
            "$push":
            {
              fullName: "$fullName",
              username: "$username",
              postID: "$postID",
              email: "$email",
              postType: "$postType",
              description: "$description",
              active: "$active",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              expiration: "$expiration",
              visibility: "$visibility",
              location: "$location",
              allowComments: "$allowComments",
              isSafe: "$isSafe",
              isOwned: "$isOwned",
              // saleLike: "$saleLike",
              // saleView: "$saleView",
              metadata: "$metadata",
              insight: "$insight",
              userProfile: "$userProfile",
              contentMedias: "$contentMedias",
              statusCB: "$statusCB",
              reportedStatus: "$reportedStatus",
              reportedUser: "$reportedUser",
              reportedUserCount: "$reportedUserCount",
              contentModeration: "$contentModeration",
              contentModerationResponse: "$contentModerationResponse",
              apsara: "$apsara",
              apsaraId: "$apsaraId",
              apsaraThumbId: "$apsaraThumbId",
              mediaType: "$mediaType",
              musicTitle: "$musicTitle",
              artistName: "$artistName",
              albumName: "$albumName",
              apsaraMusic: "$apsaraMusic",
              apsaraThumnail: "$apsaraThumnail",
              genre: "$genre",
              theme: "$theme",
              mood: "$mood",
              avatar:
              {
                $cond: {
                  if: {
                    $eq: ["$avatar", []]
                  },
                  then: null,
                  else: {
                    "$arrayElemAt": ["$avatar", 0]
                  }
                }
              },
              privacy: "$privacy",
              isViewed: "$isViewed",
              isLike: "$isLike",
            }
          }
        }
      },
      {
        "$sort":
        {
          newcreatedAt: 1
        }
      },
      {
        "$project":
        {
          _id: 0,
          username: "$_id.username",
          email: "$_id.email",
          //newcreatedAt:1,
          //oldcreatedAt:1,
          story: 1
        }
      }
    ]);

    return query;
  }

  async checkFriendListdata(email1: string, email2: string)
  {
    var query = await this.ContenteventsModel.aggregate([
        {
          "$match":
          {
            "$and" : 
            [
              {
                  "eventType" : "FOLLOWER"
              },
              {
                  "email":email1
              },
              {
                  "receiverParty" : email2
              },
              {
                  "active" : true
              },
            ]
          }
        }
    ]);

    return query;
  }
}
