import { ModelTypes, SpeedPriority, queryModel } from "@lytix/client/Optimodel";
import LytixCreds from "@lytix/client/envVars";
// Load the API key from environment variables
// const API_KEY = "sk-proj-Ti8vuo9Jzw3hTrD0WmLdT3BlbkFJL11o5nlKnOTRQf4lgQQ6"

const LX_API_KEY = process.env.NEXT_PUBLIC_LX_API_KEY;
LytixCreds.setAPIKey(LX_API_KEY);

export const optimodel = async (prompt) => {
  // const prompt = "Hello How are you?";
  const response = await queryModel({
    model: ModelTypes.gpt_4o_mini,
    messages: [
      { role: "user", content: prompt },
      { role: "system", content: "Be a helpful coach" },
    ],
    speedPriority: SpeedPriority.low,
    temperature: 0.5,
    //@sid how would i list other models here?
    fallbackModels: [ModelTypes.gpt_4o_mini],
    // validator: number_validator,
    maxGenLen: 250,
  });
  console.log(`Got response: ${response}`);
  return response;
};
