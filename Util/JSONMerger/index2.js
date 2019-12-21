const path = require('path');
const fs = require('fs');

const folderPath = 'C:\\ACS\\AI\\Projects\\FantasyPoints\\Data\\player_stats';
var self = this;
function readFromContent(jsonData, targetArray) {
    let players = jsonData.stats.content;
    let requiredInfo = players.map((player) => {
        var returnInfo = {}
        returnInfo.playerId = player.owner.playerId;
        returnInfo._playerLastName = player.owner.name.last;
        returnInfo.position = player.owner.info.position;
        if (player.owner.currentTeam) {
            returnInfo.currentTeamId = player.owner.currentTeam.club.id;
            returnInfo._currentTeamAbbr = player.owner.currentTeam.club.abbr;
            returnInfo._currentTeamName = player.owner.currentTeam.club.name;
            returnInfo._currentTeamAltId = player.owner.currentTeam.altIds.opta;
        }
        returnInfo.rank = player.rank;
        returnInfo.statValue = player.value;
        // switch(jsonData.entity) {
        //     case 'total_cross':
        //         returnInfo._crosses = player.value;
        //         break;
        //     case 'goal_assist' :
        //         returnInfo._
        // }
        
        return returnInfo;
    });
    //console.log(requiredInfo);
    targetArray.push(...requiredInfo);
}

fs.readdir(folderPath,(err, filesNames) => {
    if(err) {
        return 'Some error while processing path ' + folderPath;
    }
    var total_crosses = [];
    var assists = [];
    var corners_taken = [];
    var freekick_scored = [];
    var goals_scored = [];
    var hit_woodwork = [];
    var on_target_shots = [];
    var shots = [];

    filesNames.forEach((fileName) => {
        let rawdata = fs.readFileSync('C:\\ACS\\AI\\Projects\\FantasyPoints\\Data\\player_stats\\'+ fileName);
        let jsonData = JSON.parse(rawdata);
        if(jsonData.entity === 'total_cross') {
            readFromContent(jsonData, total_crosses);
        } else if (jsonData.entity === 'goal_assist') {
            readFromContent(jsonData, assists);
        } else if (jsonData.entity === 'corner_taken') {
            readFromContent(jsonData, corners_taken);
        } else if (jsonData.entity === 'att_freekick_goal') {
            readFromContent(jsonData, freekick_scored);
        } else if (jsonData.entity === 'goals') {
            readFromContent(jsonData, goals_scored);
        } else if (jsonData.entity === 'hit_woodwork') {
            readFromContent(jsonData, hit_woodwork);
        } else if (jsonData.entity === 'ontarget_scoring_att') {
            readFromContent(jsonData, on_target_shots);
        } else if (jsonData.entity === 'total_scoring_att') {
            readFromContent(jsonData, shots);
        } 
    });
    console.log('Crosses array size : ' + total_crosses.length);
    console.log('Assists array size : ' + assists.length);
    console.log('Corner taken array size : ' + corners_taken.length);
    console.log('Freekick scored array size : ' + freekick_scored.length);
    console.log('Goals scored array size : ' + goals_scored.length);
    console.log('Hit woodwork array size : ' + hit_woodwork.length);
    console.log('On target shots array size : ' + on_target_shots.length);
    console.log('Shots array size : ' + shots.length);

    var all_players_stats = [];
    for(var i = 0 ; i < 200000; i++) {
        var playerFoundCross = total_crosses.filter((current)=> {
            if(i === current.playerId) {
                return true;
            }
            return false;
        });
        var playerFoundAssist = assists.filter((current)=> {
            if(i === current.playerId) {
                return true;
            }
            return false;
        });
        var playerFoundCorners = corners_taken.filter((current)=> {
            if(i === current.playerId) {
                return true;
            }
            return false;
        });
        var playerFoundFreekick = freekick_scored.filter((current)=> {
            if(i === current.playerId) {
                return true;
            }
            return false;
        });
        var playerFoundGoals = goals_scored.filter((current)=> {
            if(i === current.playerId) {
                return true;
            }
            return false;
        });
        var playerFoundWoodwork = hit_woodwork.filter((current)=> {
            if(i === current.playerId) {
                return true;
            }
            return false;
        });
        var playerFoundTargetShots = on_target_shots.filter((current)=> {
            if(i === current.playerId) {
                return true;
            }
            return false;
        });
        var playerFoundShots = shots.filter((current)=> {
            if(i === current.playerId) {
                return true;
            }
            return false;
        });

        var currentPlayer = playerFoundCross || playerFoundAssist || playerFoundCorners || playerFoundFreekick || playerFoundGoals ||  playerFoundWoodwork || playerFoundTargetShots || playerFoundShots;
        if(currentPlayer === undefined || currentPlayer === null || currentPlayer.length === 0) {
            continue;
        }

        currentPlayer[0].crosses_value = (playerFoundCross && playerFoundCross.length !== 0 )? playerFoundCross[0].statValue : 0;
        currentPlayer[0].assists_value = (playerFoundAssist && playerFoundAssist.length !== 0)? playerFoundAssist[0].statValue : 0;
        currentPlayer[0].corners_taken_value = (playerFoundCorners && playerFoundCorners.length !== 0)? playerFoundCorners[0].statValue : 0;
        currentPlayer[0].freekick_scored_value = (playerFoundFreekick && playerFoundFreekick.length !== 0)? playerFoundFreekick[0].statValue : 0;
        currentPlayer[0].goals_value = (playerFoundGoals && playerFoundGoals.length !== 0)? playerFoundGoals[0].statValue : 0;
        currentPlayer[0].woodwork_hit_value = (playerFoundWoodwork && playerFoundWoodwork.length !== 0)? playerFoundWoodwork[0].statValue : 0;
        currentPlayer[0].on_target_shots_value = (playerFoundTargetShots && playerFoundTargetShots.length !== 0)? playerFoundTargetShots[0].statValue : 0;
        currentPlayer[0].shots_value = (playerFoundShots && playerFoundShots.length !== 0)? playerFoundShots[0].statValue : 0;
        all_players_stats.push(currentPlayer[0]);
    }

    var fileContent = 'player_id,_player_last_name,position,current_team_id,_current_team_abbr,_current_team_name,_current_team_alt_id,_rank,crosses_value,assists_value,corners_taken_value,freekick_scored_value,goals_value,woodwork_hit_value,on_target_shots_value,shots_value\n'
    all_players_stats.forEach((player_stats)=> {
        fileContent += player_stats.playerId + ',' + player_stats._playerLastName + ',' +player_stats.position + ',';
        fileContent += ((player_stats.currentTeamId) ? player_stats.currentTeamId : '') + ',';
        fileContent += ((player_stats._currentTeamAbbr) ? player_stats._currentTeamAbbr : '') + ',';
        fileContent += ((player_stats._currentTeamName) ? player_stats._currentTeamName : '') + ',';
        fileContent += ((player_stats._currentTeamAltId) ? player_stats._currentTeamAltId : '') + ',';
        fileContent += player_stats.rank + ',' ;
        fileContent += player_stats.crosses_value + ',';
        fileContent += player_stats.assists_value + ',';
        fileContent += player_stats.corners_taken_value + ',';
        fileContent += player_stats.freekick_scored_value + ',';
        fileContent += player_stats.goals_value + ',';
        fileContent += player_stats.woodwork_hit_value + ',';
        fileContent += player_stats.on_target_shots_value + ',';
        fileContent += player_stats.shots_value + '\n';
    });


    // writeFile for total crosses
    fs.writeFile('dist/playersStats.csv', fileContent, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });

});



