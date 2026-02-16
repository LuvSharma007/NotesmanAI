// import { getContext } from './tools/getContextTool.js';
// import { createAgent } from 'langchain';
// import {z} from 'zod'
// export const agent = createAgent({
//     name:'Notesman Agent',
//     description:`You're a Helpful Assistant that always answers questions based on the user-uploaded documents.
//     if user ask any questions always call get-context tool to get some context about the user question and find the relavent answers from the vectore Database
//     if the user is causally taking to you avoid the user question.
//     if the question is not relates to the document , strictly don't answer.`,
//     model:'gpt-4.1-nano',
//     tools:[getContext],
//     contextSchema:z.string({
//         userId:z.string(),
//         fileId:z.string(),
//         qdrantCollectionName:z.string()
//     })
// })