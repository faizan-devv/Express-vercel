const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { BadRequestError } = require('../../utils/errorTypes');
const { DOCUMENTS_PATH } = require('../../constants/multerConstants');

const PALM_KEY = 'AIzaSyAhFQ0JFLG0eAQ3mDa577tUKYNTodEgqW8';

const getRelevancyScore = async (resumeFilePath, jobDescription) => {
  const splitted = resumeFilePath.split('/');
  try {
    const dataBuffer = await fs.readFileSync(
      path.join(DOCUMENTS_PATH, splitted[splitted.length - 1])
    );
    const pdfData = await pdf(dataBuffer);
    const promptText = `
      User CV:
      ${pdfData.text}
      
      Take your time and ensure all the fields are successfully fetched and accurate.
      
      Calculate the percentage match between CV and the job description ${jobDescription}.
      Consider the following factors in your calculation:
      1. Skill Match
      2. Education Match
      3. Experience Match
      4. Keyword Matching
      5. Industry-specific Criteria
    
      Response format:
      {
        "relevancyPercentage": "<percentage>",
      }
      Note: Remove the word JSON or json outside {} brackets
      Note: Ensure that the response adheres to the provided JSON format for all fields. Verify that the information is correctly formatted and accurate. If the date of birth is mentioned in the CV, replace "date_of_birth" with the actual date. Explicitly state if any information is missing.
    `;

    const llm = new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      maxOutputTokens: 8000,
      apiKey: PALM_KEY,
    });

    const generatedText = await llm.invoke(promptText);
    const cleanedResponse = generatedText.content
      .replace(/`/g, '')
      .replace(/"([^"\\]*(\\.[^"\\]*)*)\n([^"\\]*(\\.[^"\\]*)*)"/g, '"$1 $3"');

    return JSON.parse(cleanedResponse);
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const parseResume = async (pdfFilePath) => {
  try {
    const dataBuffer = await fs.readFileSync(pdfFilePath);
    const pdfData = await pdf(dataBuffer);

    const promptText = `
      User CV:
      ${pdfData.text}
      
      Take your time and parse this CV data to following format Response format

      Response format:
      {
        "structured_cv": {
          "name": "<candidate's name>",
          "email": "<candidate's email>",
          "gender": "<candidate's gender>",
          "summary": "<string of 250 words>",
          "address":   {
            "city": "<city>",
            "state": "<state>",
            "country": "<country>"
          },
          "social_accounts": [<user_provided_social_accounts>],
          "phone_number": "<comma-separated numbers>",
          "languages": ["<user_mentioned_languages>"],
          "date_of_birth": "",
          "skills": "<array of strings>",
          "education": [
            {
              "degree": "<degree>",
              "institution": "<institution>",
              "description": "<description in 1000 characters>"
              "year": "<year>"
              "location"  {
                "city": "<city>",
                "state": "<state>",
                "country": "<country>"
              }
            },
          ],
          "work_experience": [
            {
              "position": "<position>",
              "company": "<company>",
              "description": "<work_description_summary in 1000 characters>",
              "startDate": "<year>",
              "endDate": "<year>",
              "location"  {
                "city": "<city>",
                "state": "<state>",
                "country": "<country>"
              },
              "isCurrentRole": "<bool>"
            },
          ]
        }
      }
      
      Enter all social accounts in the following format:
      "socialAccounts": ["https://******", so on...],
      
      Extract the dateOfBirth from the CV text. If not available, leave it empty:
      "date_of_birth": ""
      Note: response should be valid json so it can be parseable by JSON.Parse
      For <year> in work_experience and education return year in MM/YYYY format

      Note:- For <year> in work_experience and education return year in MM/YYYY format and Dont write the word json on top of result and check for missing brackets and commas and remove extra white spaces and remove character Apostrophe outside the brackets { }
    `;

    const llm = new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      maxOutputTokens: 8000,
      apiKey: PALM_KEY,
    });

    const generatedText = await llm.invoke(promptText);
    const cleanedResponse = generatedText.content
      .replace(/`/g, '')
      .replace(/"([^"\\]*(\\.[^"\\]*)*)\n([^"\\]*(\\.[^"\\]*)*)"/g, '"$1 $3"');

    return cleanedResponse;
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = { parseResume, getRelevancyScore };
