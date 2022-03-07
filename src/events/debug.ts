import { Event } from '../structures/Event'

export default new Event('debug', async (info) => { 
    console.log(info)
})