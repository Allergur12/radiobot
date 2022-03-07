import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from 'discord.js'
import { CommandType } from '../typings/Command'
import glob from 'glob'
import { promisify } from 'util'
import { RegisterCommandOptions } from '../typings/client'
import { Event } from './Event'
import { connect } from 'mongoose'

const globPromise = promisify(glob)

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection()

    constructor() {
        super({ intents: 32767 })
    }

    start() {
        this.registerModules()
        this.login()
        connect(process.env.mongoURI)
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default
    }

    async registerCommands({ commands, guildId}: RegisterCommandOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands).then(async cmd => {
                const getRoles = (commandName: string) => {
                    const permissions = commands.find(c => c.name === commandName).userPermissions
                    if (!permissions) return null;
                    return this.guilds.cache.get(guildId).roles.cache.filter(x => x.permissions.has(permissions) && !x.managed)
                }
                const fullPermissions = cmd.reduce((accumulator, x) => {
                    const roles = getRoles(x.name)
                    if (!roles) return accumulator

                    const permissions = roles.reduce((a, v) => {
                        return [
                            ...a,
                            {
                                id: v.id,
                                type: 'ROLE',
                                permission: true
                            }
                        ]
                    },[])

                    return [
                        ...accumulator,
                        {
                            id: x.id,
                            permissions
                        }
                    ]
                },[])

                this.guilds.cache.get(guildId).commands.permissions.set({ fullPermissions })
            })
            console.log(`Registering commands to ${guildId}`)
        } else {
            this.application?.commands.set(commands)
            console.log(`Registering global commands`)
        }
    }   

    async registerModules() {
        // Commands
        const slashCommands = [];
        const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`)
        commandFiles.forEach(async filePath => {
            const command: CommandType = await this.importFile(filePath)
            if (!command.name) return;
            if (command.userPermissions) command.defaultPermission = false
            console.log(command)

            this.commands.set(command.name, command)
            slashCommands.push(command)
        })

        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: process.env.guildId
            })
        })

        // Events
        const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`)
        eventFiles.forEach(async filePath => {
            const event: Event<keyof ClientEvents>= await this.importFile(filePath)
            this.on(event.event, event.run)
        })
    }
}