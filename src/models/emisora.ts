import mongo from 'mongoose'

const requiredString = {
    type: String,
    required: true
}

export const emisoraSchema = mongo.model(
    'emisora',
    new mongo.Schema({
        guildId: requiredString,
        emisora: requiredString
    })
)