import { Event } from "../structures/Event";
import { joinVoiceChannel, createAudioResource, createAudioPlayer } from '@discordjs/voice'
import { emisoraSchema, channelSchema } from "../models";

export default new Event('ready', async(client) => {
    console.log('Bot is online!')

    const dataEmisora = await emisoraSchema.findOne({ guildId: process.env.guildId })
    const dataChannel = await channelSchema.findOne({ guildId: process.env.guildId })

    if (!dataEmisora || !dataChannel) return

    try {
        const connection = joinVoiceChannel({
            channelId: dataChannel.channel,
            guildId: process.env.guildId,
            adapterCreator: client.guilds.cache.get(process.env.guildId).voiceAdapterCreator,
        })

        const player = createAudioPlayer()
        connection.subscribe(player)
      
        const resource = createAudioResource(dataEmisora.emisora)
        player.play(resource)
    } catch(e) {
        console.log(e)
    }
})