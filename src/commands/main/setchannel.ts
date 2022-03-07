import { Command } from "../../structures/Command";
import { channelSchema } from "../../models";

export default new Command({
    name:'setchannel',
    description:'Establece el canal de emisión',
    options: [
        {
            name:'channel',
            description:'Canal donde se conectara el bot',
            required: true,
            type: 'CHANNEL'
        }
    ],
    userPermissions: ['ADMINISTRATOR'],
    run: async({ interaction }) => {
        const { options } = interaction;
        
        const channel = options.getChannel('channel')

        if (channel.type != 'GUILD_VOICE') return interaction.followUp({ content: 'El canal debe ser de voz' })

        let data = await channelSchema.findOne({ guildId: interaction.guild.id })

        if (!data) {
            await new channelSchema({
                guildId: interaction.guild.id,
                channel: channel.id
            }).save()
        } else {
            channelSchema.findOneAndUpdate(
                {
                    guildId: interaction.guild.id
                },
                {
                    channel: channel.id
                }
            )
        }

        interaction.followUp({ content: `El nuevo canal será: ${channel}`})

    }
})