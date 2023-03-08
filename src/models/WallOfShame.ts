import { PLAYERS, Player } from "config";

export type GetWallOfShameAPIResponse = Record<Player, Record<string, number>>;

export const isGetWallOfShameAPIResponse = (
    data: Object
): data is GetWallOfShameAPIResponse => {
    return PLAYERS.every(key => data.hasOwnProperty(key));
};
