import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { temppost, temppostDocument } from './schemas/temppost.schema';


@Injectable()
export class TemppostService {
  private readonly logger = new Logger(TemppostService.name);

  constructor(
    @InjectModel(temppost.name, 'SERVER_FULL')
    private readonly loaddata: Model<temppostDocument>,
   
  ) { }

  async updateView(email: string, email_target: string, postID: string) {
    var getdata = await this.loaddata.findOne({ postID: postID }).exec();
    var setinput = {};
    setinput['$inc'] = {
        views: 1
    };
    var setCEViewer = getdata.userView;
    setCEViewer.push(email_target);
    setinput["$set"] = {
        "userView": setCEViewer
    }

    this.loaddata.updateOne(
        {
            email: email,
            postID: postID,
        },
        setinput,
        function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        },
    );
}

async updateLike(email: string, email_target: string, postID: string) {
    var getdata = await this.loaddata.findOne({ postID: postID }).exec();
    var setinput = {};
    setinput['$inc'] = {
        likes: 1
    };
    var setCELike = getdata.userLike;
    setCELike.push(email_target);
    setinput["$set"] = {
        "userLike": setCELike
    }

    this.loaddata.updateOne(
        {
            email: email,
            postID: postID,
        },
        setinput,
        function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        },
    );
}

async getRecentStory3(email: string, page: number, limit: number) {
    var query = await this.loaddata.aggregate([

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
                },
                
            },
            
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
                $and: [
                    
                    {
                        "$expr": 
                        {
                            "$eq": ["$postType", "story"]
                        }
                    },
                    {
                        "reportedStatus": {
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
                        "email": {
                            $ne: email
                        }
                    },
                    {
                        "$expr": 
                        {
                            "$gte": ["$createdAt", '$settimeStart']
                        },
                        
                    },
                    {
                        "$expr": 
                        {
                            "$lte": ["$createdAt", '$settimeEnd']
                        }
                    },
                    {
                        "$or": [
                            {
                                "reportedUser": {
                                    "$elemMatch": {
                                        "email":email,
                                        "active": false,
                                        
                                    }
                                }
                            },
                            {
                                "reportedUser.email": {
                                    "$not": {
                                        "$regex": email
                                    }
                                }
                            },
                            
                        ]
                    },
                    
                ]
            },
            
        },
        {
            $sort: {
                createdAt: 1
            }
        },
        {
            $lookup: {
                from: 'newUserBasics',
                localField: 'email',
                foreignField: 'email',
                as: 'userBasic',
                
            },
            
        },
        {
            $lookup: {
                from: 'mediamusic',
                localField: 'musicId',
                foreignField: '_id',
                as: 'music',
                
            },
            
        },
        {
            $set: {
                "urluserBadges": 
                {
                    "$filter": 
                    {
                        input: {
                            $arrayElemAt: ["$userBasic.userBadge", 0]
                        },
                        as: "listuserbadge",
                        cond: 
                        {
                            "$and": 
                            [
                                {
                                    "$eq": 
                                    [
                                        "$$listuserbadge.isActive",
                                        true
                                    ]
                                },
                                {
                                    "$lte": 
                                    [
                                        {
                                            "$dateToString": {
                                                "format": "%Y-%m-%d %H:%M:%S",
                                                "date": {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }
                                        },
                                        "$$listuserbadge.endDatetime",
                                        
                                    ]
                                }
                            ]
                        },
                        
                    }
                }
            }
        },
        {
            $set: {
                userView: {
                    $ifNull: ["$userView", []]
                },
                
            }
        },
        {
            $set: {
                isView: 
                {
                    $cond: 
                    {
                        if : {
                            $eq: ["$userView", []]
                        },
                        then: [],
                        else : 
                            {
                            $cond: 
                            {
                                if : {
                                    $in: [email, "$userView"]
                                },
                                then: "$userView",
                                else : []
                            }
                        },
                        
                    }
                },
                
            }
        },
        {
            $project: {
                "storyDate": 1,
                "postID": 1,
                "musicId": {
                    "$arrayElemAt": ['$music._id', 0]
                },
                "musicTitle": {
                    "$arrayElemAt": ['$music.musicTitle', 0]
                },
                "artistName": 
                {
                    "$arrayElemAt": ["$music.artistName", 0]
                },
                "albumName": 
                {
                    "$arrayElemAt": ["$music.albumName", 0]
                },
                "apsaraMusic": 
                {
                    "$arrayElemAt": ["$music.apsaraMusic", 0]
                },
                "apsaraThumnail": 
                {
                    "$arrayElemAt": ["$music.apsaraThumnail", 0]
                },
                "genre": 
                {
                    "$arrayElemAt": ["$music.genre.name", 0]
                },
                "theme": 
                {
                    "$arrayElemAt": ["$music.theme.name", 0]
                },
                "mood": 
                {
                    "$arrayElemAt": ["$music.mood.name", 0]
                },
                "testDate": 1,
                "mediaType": 
                {
                    "$arrayElemAt": ["$mediaSource.mediaType", 0]
                },
                "stiker": 1,
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "saleLike": 1,
                "saleView": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "tagDescription": 1,
                "metadata": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": {
                    "$arrayElemAt": ["$mediaSource.apsara", 0]
                },
                "apsaraId": {
                    "$arrayElemAt": ["$mediaSource.apsaraId", 0]
                },
                "apsaraThumbId": {
                    "$arrayElemAt": ["$mediaSource.apsaraThumbId", 0]
                },
                "insight": 
                {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                    
                }
                ,
                "fullName": {
                    "$arrayElemAt": ["$userBasic.fullName", 0]
                },
                "username": {
                    "$arrayElemAt": ["$userBasic.username", 0]
                },
                "avatar": {
                    "_id": {
                        "$arrayElemAt": ["$userBasic.profilePict.$id", 0]
                    },
                    "mediaEndpoint": {
                        "$concat": ["/profilepict/", {
                            "$arrayElemAt": ["$userBasic.profilePict.$id", 0]
                        }]
                    }
                },
                "urluserBadge": 
                {
                    "$ifNull": 
                    [
                        "$urluserBadges",
                        null
                    ]
                },
                "statusCB": 1,
                mediaEndpoint: {
                    "$concat": ["/pict/", "$postID"]
                },
                "privacy": {
                    "isCelebrity": 
                    {
                        "$arrayElemAt": ["$userBasic.isCelebrity", 0]
                    },
                    "isIdVerified": 
                    {
                        "$arrayElemAt": ["$userBasic.isIdVerified", 0]
                    },
                    "isPrivate": 
                    {
                        "$arrayElemAt": ["$userBasic.isPrivate", 0]
                    }
                },
                isView: 1
            }
        },
        {
            "$group": 
            {
                _id: {
                    email: "$email",
                    username: "$username"
                },
                story: 
                {
                    "$push": 
                    {
                        "mediaEndpoint": "$mediaEndpoint",
                        "postID": "$postID",
                        "stiker": "$stiker",
                        "musicTitle": "$musicTitle",
                        "artistName": "$artistName",
                        "albumName": "$albumName",
                        "apsaraMusic": "$apsaraMusic",
                        "apsaraThumnail": "$apsaraThumnail",
                        "genre": "$genre",
                        "theme": "$theme",
                        "mood": "$mood",
                        "mediaType": "$mediaType",
                        "email": "$email",
                        "postType": "$postType",
                        "description": "$description",
                        "active": "$active",
                        "createdAt": "$createdAt",
                        "updatedAt": "$updatedAt",
                        "expiration": "$expiration",
                        "visibility": "$visibility",
                        "location": "$location",
                        "allowComments": "$allowComments",
                        "isSafe": "$isSafe",
                        "isOwned": "$isOwned",
                        "metadata": "$metadata",
                        "contentModeration": "$contentModeration",
                        "reportedStatus": "$reportedStatus",
                        "reportedUserCount": "$reportedUserCount",
                        "contentModerationResponse": "$contentModerationResponse",
                        "reportedUser": "$reportedUser",
                        "apsara": "$apsara",
                        "apsaraId": "$apsaraId",
                        "apsaraThumbId": "$apsaraThumbId",
                        "insight": "$insight",
                        "fullName": "$fullName",
                        "username": "$username",
                        "music": {
                            "_id": "$musicId",
                            "musicTitle": "$musicTitle",
                            "artistName": "$artistName",
                            "albumName": "$albumName",
                            "apsaraMusic": "$apsaraMusic",
                            "apsaraThumnail": "$apsaraThumnail",
                            
                        },
                        "avatar": 
                        {
                            $cond: {
                                if : {
                                    $eq: ["$avatar", {}]
                                },
                                then: null,
                                else : "$avatar"
                            }
                        },
                        "urluserBadge": "$urluserBadge",
                        "statusCB": "$statusCB",
                        "privacy": "$privacy",
                        "isViewed": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$isView", []]
                                },
                                then: false,
                                else : true
                            }
                        },
                        
                    }
                }
            }
        },
        {
            "$sort": 
            {
                'story.createdAt': - 1
            }
        },
        {
            "$project": 
            {
                _id: 0,
                email: "$_id.email",
                username: "$_id.username",
                story: 1
            }
        },
        {
            $skip: (page * limit)
        },
        {
            $limit: limit
        },
    ]);


    return query;
}
}