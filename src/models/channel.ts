import mongo from 'mongoose'

const requiredString = {
    type: String,
    required: true
}

export const channelSchema = mongo.model(
    'channel',
    new mongo.Schema({
        guildId: requiredString,
        channel: requiredString
    })
)