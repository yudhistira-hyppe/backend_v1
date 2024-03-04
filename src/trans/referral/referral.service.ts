import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReferralDto } from './dto/create-referral.dto';
import { Referral, ReferralDocument } from './schemas/referral.schema';

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name, 'SERVER_FULL')
    private readonly referralModel: Model<ReferralDocument>,
  ) { }

  async create(CreateSagasDto: CreateReferralDto): Promise<Referral> {
    const createSagasDto = await this.referralModel.create(CreateSagasDto);
    return createSagasDto;
  }

  async findAll(): Promise<Referral[]> {
    return this.referralModel.find().exec();
  }

  async findAllByParentChildren(parent: string, children: string): Promise<Referral[]> {
    return this.referralModel.find({ parent: parent, children: children }).exec();
  }

  async findAllByParent(parent: string): Promise<Referral[]> {
    return this.referralModel.find({ parent: parent, verified: true }).exec();
  }

  async findAllByChildren(children: string): Promise<Referral[]> {
    return this.referralModel.find({ children: children }).exec();
  }

  async findbyparent(parent: string): Promise<Referral> {
    return this.referralModel.findOne({ parent: parent }).exec();
  }

  async findOne(id: string): Promise<Referral> {
    return this.referralModel.findOne({ _id: id }).exec();
  }

  async findOneInChild(email: string): Promise<Referral> {
    return this.referralModel.findOne({ children: email }).exec();
  }

  async findOneInChildParent(user_email_children: string, user_email_parent: string): Promise<Referral> {
    return this.referralModel.findOne({ children: user_email_parent, parent: user_email_children }).exec();
  }

  async findOneInIme(imei: string): Promise<Referral> {
    return this.referralModel.findOne({ imei: imei }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.referralModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async listAll(parentEmail: string, fromDate?: string, toDate?: string) {
    let dataPipeline = [];
    dataPipeline.push({
      "$match": {
        "parent": parentEmail
      }
    })
    if (fromDate && fromDate !== undefined) {
      dataPipeline.push({
        "$match": {
          "createdAt": {
            $gte: fromDate
          }
        }
      })
    }
    if (toDate && toDate !== undefined) {
      dataPipeline.push({
        "$match": {
          "createdAt": {
            $lte: toDate
          }
        }
      })
    }
    dataPipeline.push(
      {
        "$sort": {
          "createdAt": -1
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          localField: "children",
          foreignField: "email",
          as: "childData"
        }
      },
      {
        "$project": {
          parent: 1,
          children: 1,
          active: 1,
          verified: 1,
          imei: 1,
          createdAt: 1,
          updatedAt: 1,
          childFullName: {
            $arrayElemAt: ['$childData.fullName', 0]
          },
          childDOB: {
            $arrayElemAt: ['$childData.dob', 0]
          },
          childAge: {
            "$ifNull": [
              {
                "$dateDiff": {
                  "startDate": {
                    $dateFromString: {
                      dateString: {
                        $arrayElemAt: ['$childData.dob', 0]
                      }
                    }
                  },
                  "endDate": "$$NOW",
                  "unit": "year"
                }
              },
              null
            ]
          },
          childGender: {
            $arrayElemAt: ['$childData.gender', 0]
          },
          childCity: {
            $arrayElemAt: ['$childData.citiesName', 0]
          },
          childState: {
            $arrayElemAt: ['$childData.statesName', 0]
          },
          childAvatar: {
            mediaBasePath: {
              $arrayElemAt: ['$childData.mediaBasePath', 0]
            },
            mediaUri: {
              $arrayElemAt: ['$childData.mediaUri', 0]
            },
            mediaEndpoint: {
              $arrayElemAt: ['$childData.mediaEndpoint', 0]
            }
          }
        }
      }
    )
    let data = await this.referralModel.aggregate([
      {
        "$facet": {
          total: [
            {
              "$match": {
                "parent": parentEmail
              }
            },
            {
              "$group": {
                _id: "$parent",
                total: {
                  $sum: 1
                }
              }
            }
          ],
          data: dataPipeline
        }
      },
      {
        "$project": {
          total: {
            $arrayElemAt: ['$total.total', 0]
          },
          data: 1
        }
      }
    ])
    return data;
  }
}
