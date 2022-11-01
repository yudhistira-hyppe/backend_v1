import { IsNotEmpty, IsString } from "class-validator";
import { ObjectId } from "mongodb";

export class CreateUserbasicDto {
  _id: ObjectId;
  profileID: String;
  email: String;
  fullName: String;
  dob: String;
  gender: String;
  mobileNumber: String;
  status: String;
  event: String;
  idProofName: String;
  idProofNumber: String;
  idProofStatus: String;
  isComplete: boolean;
  isCelebrity: boolean;
  isIdVerified: boolean;
  isPrivate: boolean;
  isFollowPrivate: boolean;
  isPostPrivate: boolean;
  createdAt: String;
  updatedAt: String;
  bio: String;
  profilePict: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  proofPict: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  insight: {
    $ref: String;
    $id: String;
    $db: String;
  };
  userInterests: [{
    $ref: String;
    $id: ObjectId;
    $db: String;
  }];
  userAuth: {
    $ref: String;
    $id: ObjectId;
    $db: String;
  };
  cities: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  states: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  countries: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  languages: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  _class: String;
  pin: String;
  otp_pin: String;
  otp_request_time: Long;
  otp_expired_time: Long;
  otppinVerified: Boolean;
  otp_attemp: number;
  statusKyc: string;
  timeEmailSend: string;
  reportedStatus: string
  reportedUserCount: number
  reportedUser: any[];
  reportedUserHandle: any[];

}

export class SearchUserbasicDto {
  @IsString()
  @IsNotEmpty()
  search: String;
  pageRow: number;
  pageNumber: number;
}
