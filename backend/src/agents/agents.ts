import dotenv from "dotenv";
dotenv.config();

import { Agent, run, tool , setDefaultOpenAIKey } from '@openai/agents';
import {z} from 'zod'
import axios from "axios";

setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);
// const API_key = `1b9117d7a7f95744b52f85c4979a8624`

// const getWeather = tool({
//     name:'get_weather',
//     description:'Returns the weather for a given city.',
//     parameters: z.object({city:z.string()}),
//     async execute({city}){
//         const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`)
//         // console.log(res.data.main.temp);
//         return `The Temperature in ${city} is ${res.data.main.temp}`
//     }
// })

// const weatherAgent = new Agent({
//     name:'Weather Agent',
//     instructions:`You're a helpful weather Agent , who have an available tools to call like : [getWeather] 
//     always show temperature in celcius , if the temperature is in farenheit first convet it into celcius then return the result`,
//     model:'gpt-4.1-nano',
//     tools:[getWeather]
// })

// const result = await run(
//     weatherAgent,
//     "How is the weather in Noida ?"
// )
// console.log(result.finalOutput);


const agent = new Agent({
    name:'Notesman Agent',
    instructions:`You're a Helpful Notesman Agent that always reponsed from the Available Context`,
    model:'gpt-4.1-nano'
})
