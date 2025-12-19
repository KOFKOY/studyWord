type StrokePlayerOptions = {
  containerRef: { value: HTMLElement | null };
};

type StrokePlayerState = {
  init: () => void;
  loadCharacter: (char: string) => void;
  reset: () => void;
  dispose: () => void;
};

export function useStrokePlayer(options: StrokePlayerOptions): StrokePlayerState {
  let writer: HanziWriterInstance | null = null;
  let currentChar = "";

  function init() {}

  function loadCharacter(char: string) {
    if (!options.containerRef.value) {
      return;
    }
    if (currentChar === char && writer) {
      return;
    }
    currentChar = char;
    if (writer) {
      options.containerRef.value.innerHTML = "";
    }
    if (!window.HanziWriter) {
      notifyStatus("笔顺库未加载");
      return;
    }
    writer = window.HanziWriter.create(options.containerRef.value, char, {
      width: 220,
      height: 220,
      padding: 10,
      showCharacter: true,
      drawingColor: "#000000",
      strokeColor: "#000000",
      outlineColor: "#dddddd"
    });
    writer.hideCharacter();
    writer
      .animateCharacter({
        loop: true
      })
      .catch(() => {});
  }

  function reset() {
    if (writer && options.containerRef.value) {
      options.containerRef.value.innerHTML = "";
    }
    writer = null;
    currentChar = "";
  }

  function dispose() {
    reset();
  }

  return {
    init,
    loadCharacter,
    reset,
    dispose
  };
}
