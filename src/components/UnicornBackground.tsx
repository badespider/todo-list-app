import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import UnicornScene from "unicornstudio-react";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export default function UnicornBackground() {
  const { width, height } = useWindowSize();

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 select-none",
        "[mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      )}
      style={{ filter: "grayscale(100%)" }}
    >
      <UnicornScene production={true} projectId="YvZvqBIRoTlAvvda8GMU" width={width} height={height} />
    </div>
  );
}

