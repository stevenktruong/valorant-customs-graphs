import * as React from "react";

import { PLAYERS } from "config";

import "./PlayerSelector.css";

interface Props {
  setCurrentPlayer: CallableFunction;
}

export const PlayerSelector = (props: Props) => {
  return (
    <div className="PlayerSelector">
      <select onChange={(e) => props.setCurrentPlayer(e.target.value)}>
        {PLAYERS.map((player) => (
          <option key={player} value={player}>
            {player}
          </option>
        ))}
      </select>
    </div>
  );
};
