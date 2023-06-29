import mongoose, { Document, Schema } from 'mongoose';

export interface News extends Document {
    _id: string;
    title: string;
    body: string;
    date: string;
}

const NewsSchema: Schema = new Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    date: { type: String, required: true },
});

const NewsModel = mongoose.model<News>('News', NewsSchema);

export default NewsModel;
