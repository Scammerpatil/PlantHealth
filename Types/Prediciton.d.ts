export interface Prediction {
  _id: string;
  image: Buffer;
  prediction: string;
  createdAt: Date;
}
