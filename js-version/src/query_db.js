import { config as load_dotenv } from "dotenv"
import { CloseVectorNode } from "@langchain/community/vectorstores/closevector/node"
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import {StringOutputParser} from "@langchain/core/output_parsers"

load_dotenv()


const PROMT_TEMPLATE = `Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
`

async function query(arg) {
    console.log("Querying: " + arg)
    const vectorStore = await CloseVectorNode.load("chroma", new OpenAIEmbeddings())
    const result = await vectorStore.similaritySearch(arg, 3)
    console.log("Result:", result)

    const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 })
    const customRagPrompt = PromptTemplate.fromTemplate(PROMT_TEMPLATE)
    const ragChain = await createStuffDocumentsChain({
        llm,
        prompt: customRagPrompt,
        outputParser: new StringOutputParser()
    })

    const answer = await ragChain.invoke({
        question: arg,
        context: result
    })

    console.log("Answer: " + answer)
}

await query(process.argv[2])
