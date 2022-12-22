import { UserPayload } from "../../middlewares/current-user";
import {Request} from 'express'

export {}

declare global {
  namespace Express {
    export interface Request {
      currentUser? : UserPayload;
    }
  }
}