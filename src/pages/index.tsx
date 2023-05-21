import * as React from "react";

import Navbar from "components/Navbar";

import style from "./index.module.scss";

const HomeScreen = () => {
    return (
        <div className={style.HomeScreen}>
            <div className={style.Header}>
                <Navbar />
            </div>
            <div className={style.Main}>asdf</div>
        </div>
    );
};

export default HomeScreen;
