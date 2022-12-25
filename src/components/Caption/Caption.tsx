import * as React from "react";

import style from "./Caption.module.css";

interface Props {
  title: string;
  description: string;
  width?: string;
  height?: string;
}

export const Caption = (props: Props) => (
  <div
    className={style.CaptionContainer}
    style={{ width: props.width, height: props.height }}
  >
    <div className={style.Caption}>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
    </div>
  </div>
);
