import React from "react";
import style from "./poopCounter.module.scss";

const PoopCounter = ({ count }: { count: number }) => {
  return (
    <div className={style.poopCounter}>
      <span className={style.poopCount}>{count !== null ? count : "..."}</span>
      <span className={style.poopEmoji}>💩</span>
    </div>
  );
};

export default PoopCounter;
