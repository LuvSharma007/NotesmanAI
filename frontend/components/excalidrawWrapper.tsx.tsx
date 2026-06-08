"use client";

import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform";
import "@excalidraw/excalidraw/index.css";

interface ExtendedDiagramElement {
  type: string;
  [key: string]: any;
}

interface ExcalidrawWrapperProps {
  diagramData: ExtendedDiagramElement[] | null;
}

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({ diagramData }) => {
  // console.log("diagramData:",diagramData);
  if (!diagramData) return null;

  // 1. Separate the camera config from the visual shapes
  const cameraConfig = diagramData.find((item) => item.type === "cameraUpdate");
  const shapeData = diagramData.filter((item) => item.type !== "cameraUpdate");

  // 2. Convert only valid skeleton shapes
  const elements = convertToExcalidrawElements(shapeData as ExcalidrawElementSkeleton[]);

  // 3. Map camera properties to Excalidraw AppState fields if present
  const initialAppState = cameraConfig
    ? {
        scrollX: cameraConfig.x ?? 0,
        scrollY: cameraConfig.y ?? 0,
        theme: "dark" as const,
      }
    : { theme: "dark" as const }

  // console.info("Converted elements:", elements);

  return (
    <div className="w-[100%] h-[600px] my-4 rounded-sm border-border overflow-hidden bg-background shadow-md">
      <Excalidraw initialData={{ elements,appState:initialAppState }} theme="dark"/>
    </div>
  );
};

export default ExcalidrawWrapper;
