// src/models/User.ts
import mongoose, { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
    country: String,
    role: String,
    permissions: [String],
    description: String,
});

const User = models.User || model('User', userSchema);
export default User;
