import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBanksDto } from './dto/create-banks.dto';
import { Banks, BanksDocument } from './schemas/banks.schema';

@Injectable()
export class BanksService {

    constructor(
        @InjectModel(Banks.name, 'SERVER_FULL')
        private readonly settingsModel: Model<BanksDocument>,
    ) { }

    async findAll(): Promise<Banks[]> {
        return this.settingsModel.find().exec();
    }

    async listingAll(bankname: string, page:number, limit:number): Promise<any> {
        var pipeline = [];

        if(bankname != undefined && bankname != null)
        {
            pipeline.push(
                {
                    "$match":
                    {
                        bankname:
                        {
                            "$regex":bankname,
                            "$options":"i"
                        },
                    },
                }
            );
        }

        if (page > 0) {
            pipeline.push({ $skip: (page * limit) });
        }

        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }

        let query = null;
        if(pipeline.length == 0)
        {
            query = this.settingsModel.find().exec();
        }
        else
        {
            query = this.settingsModel.aggregate(pipeline);
        }

        return query;
    }

    async findOne(id: string): Promise<Banks> {
        return this.settingsModel.findOne({ _id: id }).exec();
    }

    async findbankcode(bankcode: string): Promise<Banks> {
        return this.settingsModel.findOne({ bankcode: bankcode }).exec();
    }

    async create(CreateBanksDto: CreateBanksDto): Promise<Banks> {
        const results = await this.settingsModel.create(
            CreateBanksDto,
        );
        return results;
    }

    async update(id:string, CreateBanks: CreateBanksDto){
        return await this.settingsModel.updateOne(
            {
                _id:id
            },
            {
                "$set":
                {
                  "bankcode":CreateBanks.bankcode,
                  "bankname":CreateBanks.bankname,
                  "bankIcon":CreateBanks.bankIcon,
                  "urlbankIcon":CreateBanks.urlbankIcon,
                  "urlEbanking":CreateBanks.urlEbanking,
                  "atm":CreateBanks.atm,
                  "internetBanking":CreateBanks.internetBanking,
                  "mobileBanking":CreateBanks.mobileBanking,
                }
            },
        )

        // return CreateBanks;
    }
}
