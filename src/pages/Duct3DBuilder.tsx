import { DuctPalette } from "@/duct3d/DuctPalette";
import { Duct3DCanvas } from "@/duct3d/Duct3DCanvas";

const Duct3DBuilder = () => {
  return (
    <div className="grid grid-cols-[300px_1fr] h-screen">
      <DuctPalette />
      <Duct3DCanvas />
    </div>
  );
};

export default Duct3DBuilder;
