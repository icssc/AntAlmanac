import mongoose from 'mongoose';
import env from '../env';

let isConnected = false;

async function connectToMongoDB(): Promise<void> {
    if (isConnected) {
        console.log('=> using existing database connection');
        return;
    }

    console.log('=> using new database connection');

    try {
        const db = await mongoose.connect(env.AA_MONGODB_URI, {});

        isConnected = db.connection.readyState === 1;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

export default connectToMongoDB;
