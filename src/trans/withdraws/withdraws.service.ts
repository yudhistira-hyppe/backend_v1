import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWithdrawsDto, OyDisburseCallbackWithdraw } from './dto/create-withdraws.dto';
import { Model, Types } from 'mongoose';
import { Withdraws, WithdrawsDocument } from './schemas/withdraws.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class WithdrawsService {

    constructor(
        @InjectModel(Withdraws.name, 'SERVER_FULL')
        private readonly withdrawsModel: Model<WithdrawsDocument>,
    ) { }

    async findAll(): Promise<Withdraws[]> {
        return this.withdrawsModel.find().exec();
    }

    async findOne(id: string): Promise<Withdraws> {
        return this.withdrawsModel.findOne({ _id: id }).exec();
    }

    async findParteneridtrx(partnerTrxid: string): Promise<Withdraws> {
        return this.withdrawsModel.findOne({ partnerTrxid: partnerTrxid }).exec();
    }
    async create(CreateWithdrawsDto: CreateWithdrawsDto): Promise<Withdraws> {
        let data = await this.withdrawsModel.create(CreateWithdrawsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateone(partnerTrxid: string, payload: OyDisburseCallbackWithdraw): Promise<Object> {
        let data = await this.withdrawsModel.updateOne({ "partnerTrxid": partnerTrxid },
            { $set: { "status": "Success", "description": "Withdraw success", verified: true, payload: payload } });
        return data;
    }
    async updateone101(partnerTrxid: string, status: string, payload: OyDisburseCallbackWithdraw): Promise<Object> {
        let data = await this.withdrawsModel.updateOne({ "partnerTrxid": partnerTrxid },
            { $set: { "status": status, "description": status, verified: true, payload: payload } });
        return data;
    }

    async updatefailed(partnerTrxid: string, status: string, description: string, payload: OyDisburseCallbackWithdraw): Promise<Object> {
        let data = await this.withdrawsModel.updateOne({ "partnerTrxid": partnerTrxid },
            { $set: { "status": status, "description": description, verified: false, payload: payload } });
        return data;
    }

    async findhistoryWithdraw(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {

        if (startdate !== undefined && enddate !== undefined && status !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idUser: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',
                        apsara: false

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        apsara: "$apsara"
                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        apsara: "$apsara"
                    }
                },
                { $sort: { timestamp: -1 }, },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);
            return query;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {
            // var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            // var dateend = currentdate.toISOString();
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idUser: iduser,

                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',
                        apsara: false

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        apsara: "$apsara"
                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        apsara: "$apsara"
                    }
                },
                { $sort: { timestamp: -1 }, },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);
            return query;
        }
        else {
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {

                        idUser: iduser
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',
                        apsara: false

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },
                        apsara: "$apsara"
                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        apsara: "$apsara"
                    }
                },
                { $sort: { timestamp: -1 }, },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);
            return query;
        }

    }
    async findhistoryWithdrawCount(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {

        if (startdate !== undefined && enddate !== undefined && status !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idUser: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                    }
                },


            ]);
            return query;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {
            // var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            // var dateend = currentdate.toISOString();
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idUser: iduser,

                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                    }
                },


            ]);
            return query;
        }
        else {
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {

                        idUser: iduser
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                    }
                },


            ]);
            return query;
        }

    }

    async findhistoryWithdrawdetail(id: ObjectId, iduser: ObjectId) {
        const query = await this.withdrawsModel.aggregate([
            {
                $match: {
                    _id: id,
                    idUser: iduser
                }
            },

            {
                $addFields: {
                    type: 'Withdrawal',

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $project: {
                    iduser: "$idUser",
                    type: "$type",
                    timestamp: "$timestamp",
                    partnerTrxid: "$partnerTrxid",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    description: "$description",
                    status: "$status",
                    idAccountBank: "$idAccountBank",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },

                }
            }, {
                $project: {
                    iduser: "$iduser",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    type: "$type",
                    timestamp: "$timestamp",
                    partnerTrxid: "$partnerTrxid",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    description: "$description",
                    status: "$status",
                    idAccountBank: "$idAccountBank",
                }
            },


        ]);
        return query;
    }

    async findhistoryWithdrawer(iduser: ObjectId, status: string, startdate: string, enddate: string, skip: number, limit: number) {

        if (startdate !== undefined && enddate !== undefined && status !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idUser: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                    }
                },
                { $sort: { timestamp: -1 }, },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);
            return query;
        }
        else if (startdate !== undefined && enddate !== undefined && status === undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {

                        idUser: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                    }
                },
                { $sort: { timestamp: -1 }, },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);
            return query;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {

            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idUser: iduser,

                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                    }
                },
                { $sort: { timestamp: -1 }, },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);
            return query;
        }
        else {
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {

                        idUser: iduser
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                    }
                },
                { $sort: { timestamp: -1 }, },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);
            return query;
        }

    }

    async findhistoryWithdrawerCount(iduser: ObjectId, status: string, startdate: string, enddate: string) {

        if (startdate !== undefined && enddate !== undefined && status !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idUser: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);
            return query;
        }
        else if (startdate !== undefined && enddate !== undefined && status === undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {

                        idUser: iduser,
                        timestamp: { $gte: startdate, $lte: dateend }
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);
            return query;
        }
        else if (startdate === undefined && enddate === undefined && status !== undefined) {

            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {
                        status: status,
                        idUser: iduser,

                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);
            return query;
        }
        else {
            const query = await this.withdrawsModel.aggregate([
                {
                    $match: {

                        idUser: iduser
                    }
                },

                {
                    $addFields: {
                        type: 'Withdrawal',

                    },
                },
                {
                    $lookup: {
                        from: "userbasics",
                        localField: "idUser",
                        foreignField: "_id",
                        as: "userbasics_data"
                    }
                }, {
                    $project: {
                        iduser: "$idUser",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                        user: {
                            $arrayElemAt: [
                                "$userbasics_data",
                                0
                            ]
                        },

                    }
                }, {
                    $project: {
                        iduser: "$iduser",
                        fullName: "$user.fullName",
                        email: "$user.email",
                        type: "$type",
                        timestamp: "$timestamp",
                        partnerTrxid: "$partnerTrxid",
                        amount: "$amount",
                        totalamount: "$totalamount",
                        status: "$status",
                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);
            return query;
        }

    }

}
