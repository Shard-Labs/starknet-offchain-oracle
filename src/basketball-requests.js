import axios from 'axios';
import { API_KEY } from "../private/constants.js";
import { SPORTS_API_URL, SPORTS_API_HOST } from "./constants.js";

// Get a basketball game's score providing one of the team's id and date
export async function getScoreByTeamAndDate(teamId, date, season) {
    const response = await axios.get(`${SPORTS_API_URL}/games?team=${teamId}&date=${date}&season=${season}`, 
        {
            headers: {
                "x-rapidapi-host": SPORTS_API_HOST,
                "x-rapidapi-key": API_KEY
            }
        });
    
    const parsedResponse = handleResponse(response.data);
    return parsedResponse;
}



// Get a team's ID by providing the name
export async function getTeamIdByName(teamName) {
    const response = await axios.get(`${SPORTS_API_URL}/teams?name=${teamName}`, 
        {
            headers: {
                "x-rapidapi-host": SPORTS_API_HOST,
                "x-rapidapi-key": API_KEY
            }
        });
    
    return response.data.response[0].id;
}


function handleResponse(responseJSON){
    const parsedResponse = {
        homeTeam:responseJSON.response[0].teams.home.name,
        homeTeamScore:responseJSON.response[0].scores.home.total,
        awayTeam:responseJSON.response[0].teams.away.name,
        awayTeamScore:responseJSON.response[0].scores.away.total
    } 
    return parsedResponse;
}