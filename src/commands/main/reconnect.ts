import { Command } from "../../structures/Command";
import { channelSchema, emisoraSchema } from "../../models";
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice'

export default new Command({
    name:'reconnect',
    description:'Reconecta el bot al canal de la radio',
    userPermissions: ['ADMINISTRATOR'],
    run: async({ interaction }) => {
        const { options } = interaction;

        const dataEmisora = await emisoraSchema.findOne({ guildId: process.env.guildId })
        const dataChannel = await channelSchema.findOne({ guildId: process.env.guildId })

        if (!dataEmisora || !dataChannel) return

        try {
            const connection = joinVoiceChannel({
                channelId: dataChannel.channel,
                guildId: process.env.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            })

            const player = createAudioPlayer()
            connection.subscribe(player)
            
            const resource = createAudioResource(dataEmisora.emisora)
            player.play(resource)
        } catch(e) {
            console.log(e)
        }

        interaction.followUp({ content: `Bot conectado correctamente` })
    }
})