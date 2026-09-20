import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import "./tailwind.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={1373}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
