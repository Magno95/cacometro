import React from "react";
import Image from "next/image";
import Link from "next/link";
import style from "./header.module.scss";

function Header() {
  return (
    <header className={style.header}>
      <Link
        href="/"
        aria-label="Home"
        style={{ position: "relative", width: "100%", height: "auto", aspectRatio: "40 / 7", display: "block" }}
      >
        <Image src="/images/ccc-logo.png" fill alt="logo" />
      </Link>
    </header>
  );
}

export default Header;
