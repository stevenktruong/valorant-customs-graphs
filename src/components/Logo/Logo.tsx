import * as React from "react";

import style from "./Logo.module.scss";

export const Logo = () => {
    return (
        <div className={style.Logo}>
            <img src="/logo.png" />
        </div>
    );
};
