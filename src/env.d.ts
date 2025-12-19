interface HanziWriterOptions {
  width?: number;
  height?: number;
  padding?: number;
  showCharacter?: boolean;
  showOutline?: boolean;
  drawingColor?: string;
  strokeColor?: string;
  outlineColor?: string;
}

interface HanziWriterAnimationOptions {
  onComplete?: () => void;
}

interface HanziWriterInstance {
  hideCharacter(): HanziWriterInstance;
  showCharacter(): HanziWriterInstance;
  showOutline(): HanziWriterInstance;
  animateCharacter(options?: HanziWriterAnimationOptions): Promise<void>;
  pauseAnimation(): void;
}

interface HanziWriterStatic {
  create(
    element: HTMLElement,
    character: string,
    options?: HanziWriterOptions
  ): HanziWriterInstance;
}

interface Window {
  HanziWriter: HanziWriterStatic;
}
