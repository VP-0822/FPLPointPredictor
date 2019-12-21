const path = require('path');
const fs = require('fs');

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
    
const folderPath = 'C:\\ACS\\AI\\Projects\\FantasyPoints\\RawData\\fpl';
fs.readdir(folderPath,(err, filesNames) => {
    if(err) {
        return 'Some error while processing path ' + folderPath;
    }
    var playerInfoFiles = [];
    var playerFiles = [];
    filesNames.forEach((fileName) => {
        // let rawdata = fs.readFileSync('C:\\ACS\\AI\\Projects\\FantasyPoints\\Data\\player_info_prem\\'+ fileName);
        // let jsonData = JSON.parse(rawdata);
        // if(jsonData.entity === 'total_cross') {
        //     readFromContent(jsonData, total_crosses);
        // } 
        if(fileName.indexOf('Info') >= 0) {
            playerInfoFiles.push('C:\\ACS\\AI\\Projects\\FantasyPoints\\RawData\\fpl\\'+ fileName);
        } else {
            playerFiles.push('C:\\ACS\\AI\\Projects\\FantasyPoints\\RawData\\fpl\\'+ fileName);
        }
    });

    var playerInfoObjects = [];
    var playerObjects = [];

    playerInfoFiles.forEach((playerInfoFile)=> {
        let rawdata = fs.readFileSync(playerInfoFile)
        let jsonData = JSON.parse(rawdata)
        playerInfoObjects.push(jsonData)
    });

    playerFiles.forEach((playerFile)=> {
        let rawdata = fs.readFileSync(playerFile)
        let jsonData = JSON.parse(rawdata)
        playerObjects.push(jsonData)
    });

    let teamFile = 'C:\\ACS\\AI\\Projects\\FantasyPoints\\RawData\\teams_season.json'
    let rawdata = fs.readFileSync(teamFile)
    let teams = JSON.parse(rawdata)

    console.log('Players Info : ' + playerInfoObjects.length);
    console.log('Players  : ' + playerObjects.length);

    //extract playersInfo in one array
    var playerInfoArray = [];
    playerInfoObjects.forEach((pio)=> {
        if(pio.content) {
            var players = pio.content;
            players.forEach((player)=> {
                playerInfoArray.push(player);
            });
        }
    });

    console.log('Total player infos : ' + playerInfoArray.length);
    var difficulty_matrix = []
    for (let i = 0; i < 21; i ++) {
        let c = new Array(21).fill(0);
        difficulty_matrix.push(c);
    }
    playerObjects.forEach((playerObject) => {
        playerObject.fixtures.forEach((fixt) => {
            difficulty_matrix[fixt.team_h][fixt.team_a] = fixt.difficulty
            difficulty_matrix[fixt.team_a][fixt.team_h] = fixt.difficulty
        });
    });

    // difficulty_matrix.forEach((df) => {
    //     console.log(df)
    // });

    var neededPlayerInfoObjects = [];

    var gw_wise_scores = [];
    for (let i = 0; i < 21; i ++) {
        var scores = [];
        var home_team_goals_so_far = new Array(21).fill(-1);
        var away_team_goals_so_far = new Array(21).fill(-1);
        scores.push(home_team_goals_so_far);
        scores.push(away_team_goals_so_far);
        gw_wise_scores.push(scores)
    }
    
    playerObjects.forEach((playerObject)=> {
        var gw_index = 0;
        var optaId = 'undefined'
        if(playerObject.history_past && playerObject.history_past.length > 0) {
            var history_instance = playerObject.history_past[0];
            optaId = history_instance.element_code;
            if(optaId === '') {
                console.log('Opta id empty')
            }
        }
        var one_event_instance = playerObject.history[0]
        var fplId = one_event_instance.element;
        var one_fixture_instance = playerObject.fixtures[0]
        var playerTeamId = (one_fixture_instance.is_home) ? one_fixture_instance.team_h : one_fixture_instance.team_a

        var playerInfoObjects = playerInfoArray.filter((playerInfoOne) => {
            if(playerInfoOne.altIds && playerInfoOne.altIds.opta && playerInfoOne.altIds.opta.endsWith(optaId)) {
                return true;
            }
            return false;
        });
        var playerDetails = playerInfoObjects[0];
        var playerMeta = {}
        playerMeta.player_id = fplId
        playerMeta.alt_id = optaId
        playerMeta.player_team = playerTeamId
        playerMeta.name = (playerDetails) ? playerDetails.name.display : 'undefined'
        playerMeta.player_current_team = (playerDetails && playerDetails.currentTeam) ? playerDetails.currentTeam.id : 'undefined'
        playerObject.history.forEach((hist)=> {
            var feature_id = hist.fixture
            var qu = feature_id / 10
            qu = Math.floor(qu)
            var remainder = feature_id % 10
            if(qu === 0) {
                gw_index = 1;
            } else if(remainder == 0) {
                gw_index = qu;
            } else {
                gw_index = qu + 1;
            }
            var playerHistoryInstance = {}
            playerHistoryInstance.player_id = playerMeta.player_id
            playerHistoryInstance.alt_id = playerMeta.alt_id
            playerHistoryInstance.name = playerMeta.name
            playerHistoryInstance.player_team = playerMeta.player_team
            teams.forEach((team) => {
                if(team.club.id === playerMeta.player_team) {
                    playerHistoryInstance._player_team_abbr = team.club.abbr
                    playerHistoryInstance._player_team_name = team.shortName
                }
            });

            playerHistoryInstance._fixture_id = hist.fixture
            playerHistoryInstance.opponent_team = hist.opponent_team
            teams.forEach((team) => {
                if(team.club.id === hist.opponent_team) {
                    playerHistoryInstance._opponent_team_abbr = team.club.abbr
                    playerHistoryInstance._opponent_team_name = team.shortName
                }
            });

            //calculate difficulty
            playerHistoryInstance.match_difficulty = difficulty_matrix[playerHistoryInstance.player_team][playerHistoryInstance.opponent_team];
            playerHistoryInstance.was_home_match = hist.was_home ? 1 : 0
            playerHistoryInstance.player_team_goals = hist.was_home ? hist.team_h_score : hist.team_a_score
            playerHistoryInstance.opponent_team_goals = hist.was_home ? hist.team_a_score : hist.team_h_score
            
            if(playerHistoryInstance.alt_id === 'undefined') {
                console.log(playerHistoryInstance.player_id)
            } else {
                var this_gw_scores = gw_wise_scores[gw_index]
                if(playerHistoryInstance.was_home_match === 1) {
                    gw_wise_scores[gw_index][0][playerHistoryInstance.player_team] = playerHistoryInstance.player_team_goals
                    gw_wise_scores[gw_index][1][playerHistoryInstance.opponent_team] = playerHistoryInstance.opponent_team_goals
                } else {
                    gw_wise_scores[gw_index][1][playerHistoryInstance.player_team] = playerHistoryInstance.player_team_goals
                    gw_wise_scores[gw_index][0][playerHistoryInstance.opponent_team] = playerHistoryInstance.opponent_team_goals
                }
                playerHistoryInstance.gameweek_index = gw_index
                //gw_index++;
            }

            if(hist.minutes == 0) {
                playerHistoryInstance.played_good_minutes = 0
            } else if(hist.minutes < 60) {
                playerHistoryInstance.played_good_minutes = 0.5
            } else {
                playerHistoryInstance.played_good_minutes = 1
            }
            playerHistoryInstance._minutes_played = hist.minutes

            playerHistoryInstance.goal_scored = hist.goals_scored
            playerHistoryInstance.assists = hist.assists
            playerHistoryInstance.clean_sheets = hist.clean_sheets
            playerHistoryInstance.goals_conceded = hist.goals_conceded
            playerHistoryInstance.own_goals = hist.own_goals
            playerHistoryInstance.penalties_saved = hist.penalties_saved
            playerHistoryInstance.penalties_missed = hist.penalties_missed
            playerHistoryInstance.yellow_cards = hist.yellow_cards
            playerHistoryInstance.red_cards = hist.red_cards
            playerHistoryInstance.saves = hist.saves
            playerHistoryInstance.bonus = hist.bonus
            playerHistoryInstance.bps = hist.bps
            playerHistoryInstance.influence = hist.influence
            playerHistoryInstance.creativity = hist.creativity
            playerHistoryInstance.threat = hist.threat
            playerHistoryInstance.ict_index = hist.ict_index
            playerHistoryInstance.team_selected = hist.selected
            playerHistoryInstance.points = hist.total_points
            neededPlayerInfoObjects.push(playerHistoryInstance)
        });
    });
    var current_player_id = 0
    var total_points = 0
    var total_minutes_played = 0
    var total_matches_played = 0
    var is_first_match = 0
    var total_goal_scored = 0
    var total_assists = 0
    var total_clean_sheets = 0
    var total_goals_conceded = 0
    var total_own_goals = 0
    var total_penalties_saved = 0
    var total_penalties_missed = 0
    var total_yellow_cards = 0
    var total_red_cards = 0
    var total_saves = 0
    var total_bonus = 0
    var total_bps = 0
    var ict_index_score_so_far = 0

    neededPlayerInfoObjects.forEach((eachFixturePlayer)=> {
        if (current_player_id === eachFixturePlayer.player_id) {
            is_first_match = 0
        } else {
            current_player_id = eachFixturePlayer.player_id
            total_points = 0
            total_minutes_played = 0
            total_matches_played = 0
            total_goal_scored = 0
            total_assists = 0
            total_clean_sheets = 0
            total_goals_conceded = 0
            total_own_goals = 0
            total_penalties_saved = 0
            total_penalties_missed = 0
            total_yellow_cards = 0
            total_red_cards = 0
            total_saves = 0
            total_bonus = 0
            total_bps = 0
            ict_index_score_so_far = 0
            if(eachFixturePlayer.played_good_minutes !== 0) {
                is_first_match = 1
            }
        }

        if(is_first_match === 1 || total_minutes_played === 0) {
            eachFixturePlayer.avg_points_per_match = 0   
            eachFixturePlayer.avg_goals_conceded = 0
            eachFixturePlayer.avg_bps = 0
            eachFixturePlayer.avg_goal_scored = 0
            eachFixturePlayer.avg_assists = 0
            eachFixturePlayer.avg_clean_sheets = 0
            eachFixturePlayer.avg_own_goals = 0
            eachFixturePlayer.avg_penalties_saved = 0
            eachFixturePlayer.avg_penalties_missed = 0
            eachFixturePlayer.total_yellow_cards = 0
            eachFixturePlayer.total_red_cards = 0
            eachFixturePlayer.avg_saves = 0
            eachFixturePlayer.avg_bonus = 0
            eachFixturePlayer.ict_index_score_so_far = 0

        } else {
            // if(eachFixturePlayer.player_id === 166) {
            //     console.log(total_points)
            //     console.log(total_minutes_played)
            //     console.log(total_points / parseFloat(total_minutes_played))
            //     var cc = total_points / parseFloat(total_minutes_played)
            //     console.log(Math.round(cc * 100) / 100)
            //     console.log('--------------')
            // }
            if(total_matches_played > 0) {
                eachFixturePlayer.avg_goals_conceded = total_goals_conceded / parseFloat(total_matches_played)
                eachFixturePlayer.avg_goals_conceded = Math.round(eachFixturePlayer.avg_goals_conceded * 1000) / 1000
                eachFixturePlayer.avg_bps = total_bps / parseFloat(total_matches_played)
                eachFixturePlayer.avg_bps = Math.round(eachFixturePlayer.avg_bps * 1000)/1000
                eachFixturePlayer.avg_goal_scored = total_goal_scored / parseFloat(total_matches_played)
                eachFixturePlayer.avg_goal_scored = Math.round(eachFixturePlayer.avg_goal_scored * 1000)/1000
                eachFixturePlayer.avg_assists = total_assists / parseFloat(total_matches_played)
                eachFixturePlayer.avg_assists = Math.round( eachFixturePlayer.avg_assists* 1000)/1000
                eachFixturePlayer.avg_clean_sheets = total_clean_sheets / parseFloat(total_matches_played)
                eachFixturePlayer.avg_clean_sheets = Math.round( eachFixturePlayer.avg_clean_sheets* 1000)/1000
                eachFixturePlayer.avg_own_goals = total_own_goals / parseFloat(total_matches_played)
                eachFixturePlayer.avg_own_goals = Math.round( eachFixturePlayer.avg_own_goals* 1000)/1000
                eachFixturePlayer.avg_penalties_saved = total_penalties_saved / parseFloat(total_matches_played)
                eachFixturePlayer.avg_penalties_saved = Math.round( eachFixturePlayer.avg_penalties_saved* 1000)/1000
                eachFixturePlayer.avg_penalties_missed = total_penalties_missed / parseFloat(total_matches_played)
                eachFixturePlayer.avg_penalties_missed = Math.round( eachFixturePlayer.avg_penalties_missed* 1000)/1000
                eachFixturePlayer.avg_saves = total_saves / parseFloat(total_matches_played)
                eachFixturePlayer.avg_saves = Math.round( eachFixturePlayer.avg_saves* 1000)/1000
                eachFixturePlayer.avg_bonus = total_bonus / parseFloat(total_matches_played)
                eachFixturePlayer.avg_bonus = Math.round( eachFixturePlayer.avg_bonus* 1000)/1000

                eachFixturePlayer.avg_points_per_match = total_points / parseFloat(total_matches_played)
                eachFixturePlayer.avg_points_per_match = Math.round(eachFixturePlayer.avg_points_per_match * 1000) / 1000
            } else {
                eachFixturePlayer.avg_goals_conceded = 0
                eachFixturePlayer.avg_bps = 0
                eachFixturePlayer.avg_points_per_match = 0
            }
            eachFixturePlayer.total_yellow_cards = total_yellow_cards
            eachFixturePlayer.total_red_cards = total_red_cards
            eachFixturePlayer.ict_index_score_so_far = ict_index_score_so_far
            // eachFixturePlayer.avg_points_per_minute = total_points / parseFloat(total_minutes_played)
            // eachFixturePlayer.avg_points_per_minute = Math.round(eachFixturePlayer.avg_points_per_minute * 1000) / 1000

        }
        
        if(eachFixturePlayer.played_good_minutes !== 0) {
            total_points += eachFixturePlayer.points
            total_minutes_played += eachFixturePlayer._minutes_played
            total_matches_played++

            total_goal_scored += eachFixturePlayer.goal_scored
            total_assists += eachFixturePlayer.assists
            total_clean_sheets += eachFixturePlayer.clean_sheets
            total_goals_conceded += eachFixturePlayer.goals_conceded
            total_own_goals += eachFixturePlayer.own_goals
            total_penalties_saved += eachFixturePlayer.penalties_saved
            total_penalties_missed += eachFixturePlayer.penalties_missed
            total_yellow_cards += eachFixturePlayer.yellow_cards
            total_red_cards += eachFixturePlayer.red_cards
            total_saves += eachFixturePlayer.saves
            total_bonus += eachFixturePlayer.bonus
            total_bps += eachFixturePlayer.bps
            ict_index_score_so_far = eachFixturePlayer.ict_index
        }

        let gw_index = eachFixturePlayer.gameweek_index;
        if(gw_index) {
            var p_home_goals = 0,p_away_goals = 0, o_home_goals = 0, o_away_goals = 0
            var p_home_games = 0, p_away_games = 0, o_home_games = 0, o_away_games = 0
            var p_all_goals = 0, o_all_goals=0

            for (var k = 1 ; k < gw_index; k++) {
                let gw_goals = gw_wise_scores[k];
                if (gw_goals[0][eachFixturePlayer.player_team] >= 0) {
                    p_home_goals += gw_goals[0][eachFixturePlayer.player_team]
                    p_all_goals += gw_goals[0][eachFixturePlayer.player_team]
                    p_home_games++
                } else if (gw_goals[1][eachFixturePlayer.player_team] >= 0) {
                    p_away_goals += gw_goals[1][eachFixturePlayer.player_team]
                    p_all_goals += gw_goals[1][eachFixturePlayer.player_team]
                    p_away_games++
                }

                if (gw_goals[0][eachFixturePlayer.opponent_team] >= 0) {
                    o_home_goals += gw_goals[0][eachFixturePlayer.opponent_team]
                    o_all_goals += gw_goals[0][eachFixturePlayer.opponent_team]
                    o_home_games++
                } else if(gw_goals[1][eachFixturePlayer.opponent_team] >= 0) {
                    o_away_goals += gw_goals[1][eachFixturePlayer.opponent_team]
                    o_all_goals += gw_goals[1][eachFixturePlayer.opponent_team]
                    o_away_games++
                }
            }

            if(eachFixturePlayer.was_home_match) {
                eachFixturePlayer.player_team_relavent_goals = p_home_goals
                eachFixturePlayer.player_team_relavent_fixtures = p_home_games
                eachFixturePlayer.opponent_team_relavent_goals = o_away_goals
                eachFixturePlayer.opponent_team_relavent_fixtures = o_away_games
            } else {
                eachFixturePlayer.player_team_relavent_goals = p_away_goals
                eachFixturePlayer.player_team_relavent_fixtures = p_away_games
                eachFixturePlayer.opponent_team_relavent_goals = o_home_goals
                eachFixturePlayer.opponent_team_relavent_fixtures = o_home_games
            }
            //Imp fixtures
            eachFixturePlayer.player_team_total_goals = p_all_goals
            eachFixturePlayer.opponent_team_total_goals = o_all_goals
            if(eachFixturePlayer.player_team_relavent_fixtures > 0) {
                eachFixturePlayer.player_team_relavent_avg_goals = eachFixturePlayer.player_team_relavent_goals / parseFloat(eachFixturePlayer.player_team_relavent_fixtures)
                eachFixturePlayer.player_team_relavent_avg_goals = Math.round(eachFixturePlayer.player_team_relavent_avg_goals * 1000) / 1000
            } else {
                eachFixturePlayer.player_team_relavent_avg_goals = 0
            }
            if(eachFixturePlayer.opponent_team_relavent_fixtures > 0) {
                eachFixturePlayer.opponent_team_relavent_avg_goals = eachFixturePlayer.opponent_team_relavent_goals / parseFloat(eachFixturePlayer.opponent_team_relavent_fixtures)
                eachFixturePlayer.opponent_team_relavent_avg_goals = Math.round(eachFixturePlayer.opponent_team_relavent_avg_goals * 1000) / 1000
            } else {
                eachFixturePlayer.opponent_team_relavent_avg_goals = 0
            }
            eachFixturePlayer.player_team_avg_goals = eachFixturePlayer.player_team_total_goals / gw_index
            eachFixturePlayer.player_team_avg_goals = Math.round(eachFixturePlayer.player_team_avg_goals * 1000) / 1000
            eachFixturePlayer.opponent_team_avg_goals = eachFixturePlayer.opponent_team_total_goals / gw_index
            eachFixturePlayer.opponent_team_avg_goals = Math.round(eachFixturePlayer.opponent_team_avg_goals * 1000) / 1000

        } else {
            eachFixturePlayer.player_team_total_goals = 0
            eachFixturePlayer.opponent_team_total_goals = 0
            eachFixturePlayer.player_team_relavent_avg_goals = 0
            eachFixturePlayer.opponent_team_relavent_avg_goals = 0
            eachFixturePlayer.player_team_avg_goals = 0
            eachFixturePlayer.opponent_team_avg_goals = 0
        }
        
    });

    console.log('Fixture based player info number : ' + neededPlayerInfoObjects.length);

    var fileContent = '_fixture_id,player_id,alt_id,name,player_team,_player_team_abbr,_player_team_name,opponent_team,'
    fileContent += '_opponent_team_abbr,_opponent_team_name,match_difficulty,was_home_match,player_team_goals,opponent_team_goals,'
    fileContent += 'player_team_total_goals,opponent_team_total_goals,player_team_relavent_avg_goals,opponent_team_relavent_avg_goals,player_team_avg_goals,opponent_team_avg_goals,'
    fileContent += 'played_minutes,avg_goal_scored,avg_assists,avg_clean_sheets,avg_goals_conceded,avg_own_goals,avg_penalties_saved,avg_penalties_missed,total_yellow_cards,'
    // fileContent += 'total_red_cards,avg_saves,avg_bonus,avg_bps,ict_index_score_prev_match,team_selected,avg_points_per_minute,points\n'
    
    //Per match avg points
    fileContent += 'total_red_cards,avg_saves,avg_bonus,avg_bps,ict_index_score_prev_match,team_selected,avg_points_per_match,points\n'
    
    neededPlayerInfoObjects.forEach((player_stats)=> {
        fileContent += player_stats._fixture_id + ','
        fileContent += player_stats.player_id + ','
        fileContent += player_stats.alt_id + ','
        fileContent += player_stats.name + ','
        fileContent += player_stats.player_team + ','
        fileContent += player_stats._player_team_abbr + ','
        fileContent += player_stats._player_team_name + ','
        fileContent += player_stats.opponent_team + ','
        fileContent += player_stats._opponent_team_abbr + ','
        fileContent += player_stats._opponent_team_name + ','
        fileContent += player_stats.match_difficulty + ','
        fileContent += player_stats.was_home_match + ','
        fileContent += player_stats.player_team_goals + ','
        fileContent += player_stats.opponent_team_goals + ','
        
        fileContent += player_stats.player_team_total_goals + ','
        fileContent += player_stats.opponent_team_total_goals + ','
        fileContent += player_stats.player_team_relavent_avg_goals + ','
        fileContent += player_stats.opponent_team_relavent_avg_goals + ','
        fileContent += player_stats.player_team_avg_goals + ','
        fileContent += player_stats.opponent_team_avg_goals + ','

        fileContent += player_stats.played_good_minutes + ','
        fileContent += player_stats.avg_goal_scored + ','
        fileContent += player_stats.avg_assists + ','
        fileContent += player_stats.avg_clean_sheets + ','
        fileContent += player_stats.avg_goals_conceded + ','
        fileContent += player_stats.avg_own_goals + ','
        fileContent += player_stats.avg_penalties_saved + ','
        fileContent += player_stats.avg_penalties_missed + ','
        fileContent += player_stats.total_yellow_cards + ','
        fileContent += player_stats.total_red_cards + ','
        fileContent += player_stats.avg_saves + ','
        fileContent += player_stats.avg_bonus + ','
        fileContent += player_stats.avg_bps + ','
        fileContent += player_stats.ict_index_score_so_far + ','
        fileContent += player_stats.team_selected + ','
        //fileContent += player_stats.avg_points_per_minute + ','
        fileContent += player_stats.avg_points_per_match + ','
        fileContent += player_stats.points + '\n'

    });

    index = 0
    // gw_wise_scores.forEach((gwg) => {
    //     console.log('=======================================================')
    //     console.log('Gw ' + index++)
    //     console.log(gwg[0]);
    //     console.log(gwg[1]);
    // });
    // console.log('home score => ' + gw_wise_scores[0][0][1])
    // console.log('away score => ' + gw_wise_scores[0][1][1])


    // writeFile for total fixtures
    fs.writeFile('dist/fixtureWiseData.csv', fileContent, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });

});