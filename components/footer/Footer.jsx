// import PWAInstallButton from "../pwaInstallButton/PWAInstallButton";
import React from "react";

import style from "./footer.module.scss";
import Link from "next/link";
import Image from "next/image";

function Footer() {
  return (
    <nav className={style.nav}>
      <Link className={style.addPoopBtn} href="/add-poops">
        <Image src="/images/ccc-add-poop.png" height={100} width={100} alt="add poop" />
      </Link>
    </nav>
  );
}

export default Footer;
