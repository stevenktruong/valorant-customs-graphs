import { Player, ValorantMap } from "config";

export interface GetDashboardAPIResponse {
    assists_given_per_standard_game: Record<Player, any>;
    assists_received_per_standard_game: Record<Player, any>;
    easiest_matchups: Record<Player, any>;
    individual: Record<Player, any>;
    maps: Record<ValorantMap, any>;
    meta: Record<string, any>;
    running_winrate_over_time: Record<Player, any>[];
    teammate_synergy: Record<Player, any>;
}

export const isGetDashboardAPIResponse = (
    data: Object
): data is GetDashboardAPIResponse => {
    return [
        "assists_given_per_standard_game",
        "assists_received_per_standard_game",
        "easiest_matchups",
        "individual",
        "maps",
        "meta",
        "running_winrate_over_time",
        "teammate_synergy",
    ].every(key => data.hasOwnProperty(key));
};
