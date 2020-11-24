declare namespace Express {
  export interface Request {
    session: {
      userId: string;
    };
  }
}
