import Image from "next/image";
import CrayonSvg from "../../assets/crayon.svg";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <div>
      <header className={styles.container}>
        <h1>SCRIBBLE.IO</h1>
        <Image src={CrayonSvg} alt="scribble.io logo"></Image>
      </header>
    </div>
  );
}
