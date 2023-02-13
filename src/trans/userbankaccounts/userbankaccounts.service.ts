import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Model, Types } from 'mongoose';
import { Userbankaccounts, UserbankaccountsDocument } from './schemas/userbankaccounts.schema';
import { ObjectId } from 'mongodb';
import { integer } from 'aws-sdk/clients/lightsail';

@Injectable()
export class UserbankaccountsService {
    constructor(
        @InjectModel(Userbankaccounts.name, 'SERVER_FULL')
        private readonly userbankaccountsModel: Model<UserbankaccountsDocument>,
    ) { }

    async findAll(): Promise<Userbankaccounts[]> {
        return this.userbankaccountsModel.find().exec();
    }

    async findOneUser(iduser: ObjectId): Promise<Userbankaccounts[]> {

        let query = await this.userbankaccountsModel.aggregate([
            {
                $lookup: {
                    from: "banks",
                    localField: "idBank",
                    foreignField: "_id",
                    as: "dataBank"
                }
            }, {
                $project: {
                    databank: {
                        $arrayElemAt: [
                            "$dataBank",
                            0
                        ]
                    },
                    userId: "$userId",
                    noRek: "$noRek",
                    nama: "$nama",
                    statusInquiry: "$statusInquiry",
                    active: "$active"
                }
            }, {
                $project: {
                    userId: "$userId",
                    noRek: "$noRek",
                    nama: "$nama",
                    statusInquiry: "$statusInquiry",
                    active: "$active",
                    bankId: "$databank._id",
                    bankcode: "$databank.bankcode",
                    bankname: "$databank.bankname",
                    urlEbanking: "$databank.urlEbanking",
                    bankIcon: "$databank.bankIcon"
                }
            }, {
                $match: {
                    userId: iduser, active: true
                }
            }

        ]);
        return query;
    }
    async findOne(id: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ _id: id }).exec();
    }
    async findOneid(id: ObjectId): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ _id: id }).exec();
    }


    async findnorekkembar(noRek: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek }).exec();
    }
    async findnorek(noRek: string, idBank: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek, idBank: idBank }).exec();
    }

    async findnorekWithdraw(noRek: string, idBank: string, nama: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek, idBank: idBank, nama: nama }).exec();
    }
    async findnorekWithdrawuser(noRek: string, idBank: string, userid: ObjectId): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ userId: userid, noRek: noRek, idBank: idBank }).exec();
    }
    async create(CreateUserbankaccountsDto: CreateUserbankaccountsDto): Promise<Userbankaccounts> {
        let data = await this.userbankaccountsModel.create(CreateUserbankaccountsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateone(id: Types.ObjectId, description: string): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "statusInquiry": true, "description": description } });
        return data;
    }

    async updateactivetrue(id: Types.ObjectId): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "active": true } });
        return data;
    }

    async updateonefalse(id: Types.ObjectId, description: string): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "statusInquiry": false, "description": description } });
        return data;
    }

    async updateactive(id: Types.ObjectId): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "active": false } });
        return data;
    }

    // async updateAppeal(id: Types.ObjectId, updatedAt: string, userHandle: any[]) {
    //     let data = await this.userbankaccountsModel.updateOne({ "_id": id },
    //       { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
    //     return data;
    //   }
    async update(
        id: string,
        createUserbankaccountsDto: CreateUserbankaccountsDto,
    ): Promise<Userbankaccounts> {
        let data = await this.userbankaccountsModel.findByIdAndUpdate(
            id,
            createUserbankaccountsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findemail(id: ObjectId) {
        let query = await this.userbankaccountsModel.aggregate([

            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "userId",
                    foreignField: "_id",
                    as: "field"
                }
            },
            {
                $unwind: {
                    path: '$field',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    email: '$field.email',
                    fullName: '$field.fullName',
                    iduser: '$field._id'
                }
            }
        ]);

        return query;
    }

    async updateDisetujui(id: ObjectId, reason: string, updatedAt: string, reasonId: ObjectId, idUserHandle: ObjectId) {
        let data = await this.userbankaccountsModel.updateMany({ "_id": id },
            { $set: { "statusInquiry": null, "updatedAt": updatedAt, "userHandle.$[].updatedAt": updatedAt, "userHandle.$[].reasonId": reasonId, "userHandle.$[].valueReason": reason, "userHandle.$[].status": "DISETUJUI", "userHandle.$[].idUserHandle": idUserHandle, } });
        return data;
    }

    async updateDisetujuiEmpty(id: ObjectId, updatedAt: string, userHandle: any[]) {
        let data = await this.userbankaccountsModel.updateMany({ "_id": id },
            { $set: { "updatedAt": updatedAt, "userHandle": userHandle } });
        return data;
    }

    async updateDitolak(id: ObjectId, reason: string, updatedAt: string, reasonId: ObjectId, idUserHandle: ObjectId) {
        let data = await this.userbankaccountsModel.updateMany({ "_id": id },
            { $set: { "updatedAt": updatedAt, "userHandle.$[].updatedAt": updatedAt, "userHandle.$[].reasonId": reasonId, "userHandle.$[].valueReason": reason, "userHandle.$[].status": "DITOLAK", "userHandle.$[].idUserHandle": idUserHandle, } });
        return data;
    }

    async updateDitolakEmpty(id: ObjectId, updatedAt: string, userHandle: any[]) {
        let data = await this.userbankaccountsModel.updateMany({ "_id": id },
            { $set: { "updatedAt": updatedAt, "userHandle": userHandle } });
        return data;
    }

    async getlistappeal(startdate: string, enddate: string, namapemohon: string, liststatus: any[], descending: boolean, page: number, limit: number) {
        var order = null;
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            var dt = dateend.substring(0, 10);
        } catch (e) {
            dateend = "";
        }

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        }
        var pipeline = [];

        pipeline.push(
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                userHandle:
                                {
                                    "$ne": []
                                }
                            },
                            {
                                userHandle:
                                {
                                    "$ne": null
                                }
                            },

                        ]
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    userId: 1,
                    statusInquiry: 1,
                    noRek: 1,
                    nama: 1,
                    active: 1,
                    description: 1,
                    tanggalPengajuan:
                    {
                        "$last": "$userHandle.createdAt"
                    },
                    updatedAt: 1,
                    userHandle: 1,
                    statusLast:
                    {
                        "$last": "$userHandle.status"
                    },
                    reasonId:
                    {
                        "$last": "$userHandle.reasonId"
                    },
                    reasonAdmin:
                    {
                        "$last": "$userHandle.valueReason"
                    },

                }
            },
            {
                "$lookup":
                {
                    from: "userbasics",
                    let:
                    {
                        basic_fk: "$userId"
                    },
                    as: 'userbasic_data',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                            [
                                                "$_id",
                                                "$$basic_fk"
                                            ]
                                    }
                                }
                            },

                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "userauths",
                    let:
                    {
                        basic_fk:
                        {
                            "$arrayElemAt":
                                [
                                    "$userbasic_data.email",
                                    0
                                ]
                        }
                    },
                    as: 'userauth_data',
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

                        ]
                }
            },
            {
                "$project":
                {
                    _id: "$_id",
                    userId: "$userId",
                    statusInquiry: "$statusInquiry",
                    noRek: "$noRek",
                    nama: "$nama",
                    active: "$active",
                    tanggalPengajuan: "$tanggalPengajuan",
                    fullName:

                    {
                        "$arrayElemAt":
                            [
                                "$userbasic_data.fullName",
                                0
                            ]
                    }


                    ,
                    email:
                    {
                        "$arrayElemAt":
                            [
                                "$userbasic_data.email",
                                0
                            ]
                    },
                    username:
                    {
                        "$arrayElemAt":
                            [
                                "$userauth_data.username",
                                0
                            ]
                    },
                    statusLast: "$statusLast",
                    reasonId: "$reasonId",
                    reasonAdmin: "$reasonAdmin",
                    avatar:
                    {
                        mediaEndpoint:
                        {
                            "$concat":
                                [
                                    "/profilepict/",
                                    {
                                        "$last": "$userbasic_data.profilePict.$id"
                                    },

                                ]
                        }
                    },

                }
            },
        );
        pipeline.push(
            {
                $sort: {
                    tanggalPengajuan: order
                },

            },
        );

        if (namapemohon && namapemohon !== undefined) {
            pipeline.push(
                {
                    $match:
                    {
                        username: {
                            $regex: namapemohon, $options: 'i'
                        }
                    }
                }
            );
        }

        if (liststatus && liststatus !== undefined) {
            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                statusLast: {
                                    $in: liststatus
                                }
                            },

                        ]

                    }
                },
            );
        }
        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { tanggalPengajuan: { $gte: startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { tanggalPengajuan: { $lte: dateend } } });
        }

        if (page > 0) {
            pipeline.push({ $skip: (page * limit) });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        var query = await this.userbankaccountsModel.aggregate(pipeline);

        return query;
    }
    async getlistappealcount(startdate: string, enddate: string, namapemohon: string, liststatus: any[]) {

        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            var dt = dateend.substring(0, 10);
        } catch (e) {
            dateend = "";
        }


        var pipeline = [];

        pipeline.push(
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                userHandle:
                                {
                                    "$ne": []
                                }
                            },
                            {
                                userHandle:
                                {
                                    "$ne": null
                                }
                            },

                        ]
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    userId: 1,
                    statusInquiry: 1,
                    noRek: 1,
                    nama: 1,
                    active: 1,
                    description: 1,
                    tanggalPengajuan:
                    {
                        "$last": "$userHandle.createdAt"
                    },
                    updatedAt: 1,
                    userHandle: 1,
                    statusLast:
                    {
                        "$last": "$userHandle.status"
                    },
                    reasonId:
                    {
                        "$last": "$userHandle.reasonId"
                    },
                    reasonAdmin:
                    {
                        "$last": "$userHandle.valueReason"
                    },

                }
            },
            {
                "$lookup":
                {
                    from: "userbasics",
                    let:
                    {
                        basic_fk: "$userId"
                    },
                    as: 'userbasic_data',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                            [
                                                "$_id",
                                                "$$basic_fk"
                                            ]
                                    }
                                }
                            },

                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "userauths",
                    let:
                    {
                        basic_fk:
                        {
                            "$arrayElemAt":
                                [
                                    "$userbasic_data.email",
                                    0
                                ]
                        }
                    },
                    as: 'userauth_data',
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

                        ]
                }
            },
            {
                "$project":
                {
                    _id: "$_id",
                    userId: "$userId",
                    statusInquiry: "$statusInquiry",
                    noRek: "$noRek",
                    nama: "$nama",
                    active: "$active",
                    tanggalPengajuan: "$tanggalPengajuan",
                    fullName:

                    {
                        "$arrayElemAt":
                            [
                                "$userbasic_data.fullName",
                                0
                            ]
                    }


                    ,
                    email:
                    {
                        "$arrayElemAt":
                            [
                                "$userbasic_data.email",
                                0
                            ]
                    },
                    username:
                    {
                        "$arrayElemAt":
                            [
                                "$userauth_data.username",
                                0
                            ]
                    },
                    statusLast: "$statusLast",
                    reasonId: "$reasonId",
                    reasonAdmin: "$reasonAdmin",
                    avatar:
                    {
                        mediaEndpoint:
                        {
                            "$concat":
                                [
                                    "/profilepict/",
                                    {
                                        "$last": "$userbasic_data.profilePict.$id"
                                    },

                                ]
                        }
                    },

                }
            },
        );


        if (namapemohon && namapemohon !== undefined) {
            pipeline.push(
                {
                    $match:
                    {
                        username: {
                            $regex: namapemohon, $options: 'i'
                        }
                    }
                }
            );
        }

        if (liststatus && liststatus !== undefined) {
            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                statusLast: {
                                    $in: liststatus
                                }
                            },

                        ]

                    }
                },
            );
        }
        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { tanggalPengajuan: { $gte: startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { tanggalPengajuan: { $lte: dt } } });
        }

        pipeline.push({
            $group: {
                _id: null,
                totalpost: {
                    $sum: 1
                }
            }
        });
        var query = await this.userbankaccountsModel.aggregate(pipeline);

        return query;
    }

    async getDetailAccountBankById(id: string) {
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId(id);
        var query = await this.userbankaccountsModel.aggregate([
            {
                "$match":
                {
                    _id: iddata
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    userId: 1,
                    statusInquiry: 1,
                    idBank: 1,
                    noRek: 1,
                    nama: 1,
                    active: 1,
                    description: 1,
                    tanggalPengajuan:
                    {
                        "$dateFromString":
                        {
                            dateString:
                            {
                                "$last": "$userHandle.createdAt"
                            }
                        }
                    },
                    createdAt: 1,
                    updatedAt: 1,
                    userHandle: 1,
                    statusLast:
                    {
                        "$last": "$userHandle.status"
                    },
                    reasonId:
                    {
                        "$last": "$userHandle.reasonId"
                    },
                    reasonAdmin:
                    {
                        "$last": "$userHandle.valueReason"
                    },
                    SupportfsSourceName: 1,
                }
            },
            {
                "$lookup":
                {
                    from: "userbasics",
                    let:
                    {
                        basic_fk: "$userId"
                    },
                    as: 'userbasic_data',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                            [
                                                "$_id",
                                                "$$basic_fk"
                                            ]
                                    }
                                }
                            },
                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "userauths",
                    let:
                    {
                        basic_fk:
                        {
                            "$arrayElemAt":
                                [
                                    "$userbasic_data.email", 0
                                ]
                        }
                    },
                    as: 'userauth_data',
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
                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "banks",
                    let:
                    {
                        bank_fk: "$idBank"
                    },
                    as: 'bank_data',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq": ["$_id", "$$bank_fk"]
                                    }
                                }
                            }
                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "countries",
                    let:
                    {
                        country_fk:
                        {
                            "$arrayElemAt":
                                [
                                    "$userbasic_data.countries.$id", 0
                                ]
                        }
                    },
                    as: 'country_data',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq": ["$_id", "$$country_fk"]
                                    }
                                }
                            },
                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "areas",
                    let:
                    {
                        area_fk:
                        {
                            "$arrayElemAt":
                                [
                                    "$userbasic_data.states.$id", 0
                                ]
                        }
                    },
                    as: 'area_data',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq": ["$_id", "$$area_fk"]
                                    }
                                }
                            },
                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "mediaproofpicts",
                    let:
                    {
                        media_id:
                        {
                            "$arrayElemAt":
                                [
                                    "$userbasic_data.proofPict.$id", 0
                                ]
                        }
                    },
                    as: 'media_data',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq": [
                                            "$_id",
                                            "$$media_id"
                                        ]
                                    }
                                }
                            }
                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "cities",
                    let:
                    {
                        city_fk:
                        {
                            "$arrayElemAt":
                                [
                                    "$userbasic_data.cities.$id", 0
                                ]
                        }
                    },
                    as: 'city_data',
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq": ["$_id", "$$city_fk"]
                                    }
                                }
                            },
                        ]
                }
            },
            {
                "$project":
                {
                    _id: "$_id",
                    userId: "$userId",
                    statusInquiry: "$statusInquiry",
                    noRek: "$noRek",
                    bankRek:
                    {
                        "$arrayElemAt":
                            [
                                "$bank_data.bankname", 0
                            ]
                    },
                    createdAt: "$createdAt",
                    namaRek: "$nama",
                    active: "$active",
                    tanggalPengajuan: "$tanggalPengajuan",
                    // userHandle:"$userHandle",
                    // fkbasic:"$userbasic_data",
                    // fkauth:"$userauth_data",
                    fullName:
                    {
                        "$last": "$userbasic_data.fullName"
                    },
                    gender:
                    {
                        "$last": "$userbasic_data.gender"
                    },
                    dob:
                    {
                        "$last": "$userbasic_data.dob"
                    },
                    mobileNumber:
                    {
                        "$last": "$userbasic_data.mobileNumber"
                    },
                    statusUser:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$userbasic_data.isIdVerified", 0
                                                ]
                                        },
                                        false
                                    ],
                            },
                            then: "Basic",
                            else: "Premium"
                        }
                    },
                    email:
                    {
                        "$last": "$userauth_data.email"
                    },
                    username:
                    {
                        "$last": "$userauth_data.username"
                    },
                    statusLast: "$statusLast",
                    reasonId: "$reasonId",
                    reasonAdmin: "$reasonAdmin",
                    avatar:
                    {
                        mediaEndpoint:
                        {
                            "$concat":
                                [
                                    "/profilepict/",
                                    {
                                        "$last": "$userbasic_data.profilePict.$id"
                                    },
                                ]
                        }
                    },
                    namaKTP:
                    {
                        "$arrayElemAt":
                            [
                                "$media_data.nama", 0
                            ]
                    },
                    dokumenPendukung: "$SupportfsSourceName",
                    country:
                    {
                        "$arrayElemAt":
                            [
                                "$country_data.country", 0
                            ]
                    },
                    area:
                    {
                        "$arrayElemAt":
                            [
                                "$area_data.stateName", 0
                            ]
                    },
                    city:
                    {
                        "$arrayElemAt":
                            [
                                "$city_data.cityName", 0
                            ]
                    }
                }
            },
            {
                "$unwind":
                {
                    path: "$dokumenPendukung"
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    userId: 1,
                    statusInquiry: 1,
                    noRek: 1,
                    bankRek: 1,
                    namaRek: 1,
                    active: 1,
                    createdAt: 1,
                    tanggalPengajuan: 1,
                    fullName: 1,
                    gender: 1,
                    dob: 1,
                    mobileNumber: 1,
                    statusUser: 1,
                    email: 1,
                    username: 1,
                    statusLast: 1,
                    reasonId: 1,
                    reasonAdmin: 1,
                    avatar: 1,
                    namaKTP: 1,
                    temp1:
                    {
                        "$split":
                            [
                                "$dokumenPendukung", "_"
                            ]
                    },
                    country: 1,
                    area: 1,
                    city: 1
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    userId: 1,
                    statusInquiry: 1,
                    noRek: 1,
                    bankRek: 1,
                    namaRek: 1,
                    active: 1,
                    tanggalPengajuan: 1,
                    fullName: 1,
                    gender: 1,
                    dob: 1,
                    mobileNumber: 1,
                    statusUser: 1,
                    email: 1,
                    username: 1,
                    createdAt: 1,
                    statusLast: 1,
                    reasonId: 1,
                    reasonAdmin: 1,
                    avatar: 1,
                    namaKTP: 1,
                    temp2:
                    {
                        "$split":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$temp1", 1
                                        ]
                                }, "."
                            ]
                    },
                    country: 1,
                    area: 1,
                    city: 1
                }
            },
            {
                "$project":
                {
                    id: "$_id",
                    userId: 1,
                    statusInquiry: 1,
                    noRek: 1,
                    bankRek: 1,
                    namaRek: 1,
                    active: 1,
                    tanggalPengajuan: 1,
                    fullName: 1,
                    gender: 1,
                    dob: 1,
                    mobileNumber: 1,
                    statusUser: 1,
                    email: 1,
                    createdAt: 1,
                    username: 1,
                    statusLast: 1,
                    reasonId: 1,
                    reasonAdmin: 1,
                    avatar: 1,
                    namaKTP: 1,
                    dokumenPendukung:
                    {
                        "$concat":
                            [
                                "/supportfile/",
                                {
                                    "$toString": "$_id"
                                },
                                "/",
                                {
                                    "$arrayElemAt":
                                        [
                                            "$temp2", 0
                                        ]
                                }
                            ]
                    },
                    country: 1,
                    area: 1,
                    city: 1
                }
            },
            {
                "$group":
                {
                    _id: "$id",
                    // iduser:
                    // {
                    //     "$first":"$id"
                    // },
                    userId:
                    {
                        "$first": "$userId"
                    },
                    statusInquiry:
                    {
                        "$first": "$statusInquiry"
                    },
                    noRek:
                    {
                        "$first": "$noRek"
                    },
                    bankRek:
                    {
                        "$first": "$bankRek"
                    },
                    namaRek:
                    {
                        "$first": "$namaRek"
                    },
                    active:
                    {
                        "$first": "$active"
                    },
                    tanggalPengajuan:
                    {
                        "$first": "$tanggalPengajuan"
                    },
                    fullName:
                    {
                        "$first": "$fullName"
                    },
                    gender:
                    {
                        "$first": "$gender"
                    },
                    dob:
                    {
                        "$first": "$dob"
                    },
                    mobileNumber:
                    {
                        "$first": "$mobileNumber"
                    },
                    statusUser:
                    {
                        "$first": "$statusUser"
                    },
                    email:
                    {
                        "$first": "$email"
                    },
                    waktuPendaftaran:
                    {
                        "$first": "$createdAt"
                    },
                    username:
                    {
                        "$first": "$username"
                    },
                    statusLast:
                    {
                        "$first": "$statusLast"
                    },
                    reasonId:
                    {
                        "$first": "$reasonId"
                    },
                    reasonAdmin:
                    {
                        "$first": "$reasonAdmin"
                    },
                    avatar:
                    {
                        "$first": "$avatar"
                    },
                    dokumenPendukung:
                    {
                        "$push": "$dokumenPendukung"
                    },
                    namaKTP:
                    {
                        "$first": "$namaKTP"
                    },
                    country:
                    {
                        "$first": "$country"
                    },
                    area:
                    {
                        "$first": "$area"
                    },
                    city:
                    {
                        "$first": "$city"
                    },
                }
            }
        ]);

        return query[0];
    }

    async countAppealakunbank(startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }


        var pipeline = [];

        if (startdate === undefined && enddate === undefined) {
            pipeline.push(
                {
                    $project: {
                        active: 1,
                        createdAtReportLast: {
                            $last: "$userHandle.createdAt"
                        },
                        lastAppeal: {
                            $cond: {
                                if: {
                                    $or: [{
                                        $eq: ["$userHandle", null]
                                    }, {
                                        $eq: ["$userHandle", ""]
                                    }, {
                                        $eq: ["$userHandle", []]
                                    }, {
                                        $eq: ["$userHandle", "Lainnya"]
                                    }]
                                },
                                then: null,
                                else: {
                                    $last: "$userHandle.status"
                                }
                            },

                        },

                    }
                },
                {
                    $match: {


                        active: true,
                        lastAppeal: {
                            $ne: null
                        },

                    }
                },
                {
                    $group: {
                        _id: "$lastAppeal",
                        myCount: {
                            $sum: 1
                        },

                    }
                },
            );
        }
        else {
            pipeline.push(
                {
                    $project: {
                        active: 1,
                        createdAtReportLast: {
                            $last: "$userHandle.createdAt"
                        },
                        lastAppeal: {
                            $cond: {
                                if: {
                                    $or: [{
                                        $eq: ["$userHandle", null]
                                    }, {
                                        $eq: ["$userHandle", ""]
                                    }, {
                                        $eq: ["$userHandle", []]
                                    }, {
                                        $eq: ["$userHandle", "Lainnya"]
                                    }]
                                },
                                then: null,
                                else: {
                                    $last: "$userHandle.status"
                                }
                            },

                        },

                    }
                },
                {
                    $match: {


                        active: true,
                        lastAppeal: {
                            $ne: null
                        },
                        createdAtReportLast: { "$gte": startdate, "$lte": dateend }
                    }
                },
                {
                    $group: {
                        _id: "$lastAppeal",
                        myCount: {
                            $sum: 1
                        },

                    }
                },
            );
        }

        var query = await this.userbankaccountsModel.aggregate(pipeline);

        return query;
    }
}
