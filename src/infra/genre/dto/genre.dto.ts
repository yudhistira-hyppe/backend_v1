import mongoose from "mongoose";

export class GenreDto {
  _id: mongoose.Types.ObjectId;
  name: String;
  name_id: String;
  langIso: String;
  icon: String;
  createdAt: String
  updatedAt: String
}