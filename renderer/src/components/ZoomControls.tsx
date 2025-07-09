import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut, onZoomToFit }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onZoomIn}
        className="w-10 h-10 p-0 glass glass-hover"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={onZoomOut}
        className="w-10 h-10 p-0 glass glass-hover"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={onZoomToFit}
        className="w-10 h-10 p-0 glass glass-hover"
        title="Zoom to Fit"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
}