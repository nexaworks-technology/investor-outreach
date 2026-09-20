import { Composition } from "remotion";
import { MainVideoShort } from "./MainVideoShort";
import { MainVideoLong } from "./MainVideoLong";
import "./tailwind.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideoShort"
        component={MainVideoShort}
        durationInFrames={1017}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MainVideoLong"
        component={MainVideoLong}
        durationInFrames={1538}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
