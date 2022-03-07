import { Command } from "../../structures/Command";
import { emisoraSchema } from "../../models";

export default new Command({
    name:'setemisora',
    description:'Establece una emisora',
    options: [
        {
            name:'url',
            description:'URL de la emisora',
            required: true,
            type: 'STRING'
        }
    ],
    userPermissions: ['ADMINISTRATOR'],
    run: async({ interaction }) => {
        const { options } = interaction;
        
        const url = options.getString('url')

        let data = await emisoraSchema.findOne({ guildId: interaction.guild.id })

        if (!data) {
            await new emisoraSchema({
                guildId: interaction.guild.id,
                emisora: url
            }).save()
        } else {
            emisoraSchema.findOneAndUpdate(
                {
                    guildId: interaction.guild.id
                },
                {
                    emisora: url
                }
            )
        }

        interaction.followUp({ content: `URL establecida de la emisora establecida a: ${url}`})

    }
})