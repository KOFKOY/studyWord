<template>
  <div class="page">
    <header class="header">
      <h1 class="title">练字助手</h1>
    </header>
    <main class="main">
      <section class="controls">
        <input
          v-model="inputValue"
          class="input"
          type="text"
          maxlength="50"
          :placeholder="inputPlaceholder"
          @input="handleInput"
        />
        <button class="button" type="button" @click="handleGenerate">
          生成
        </button>
        <button class="button secondary" type="button" @click="handleClear">
          清空
        </button>
        <button class="button primary" type="button" @click="handlePrint">
          打印
        </button>
      </section>
      <section class="status" v-if="statusMessage">
        <span>{{ statusMessage }}</span>
      </section>
      <section class="content">
        <div class="layout">
          <div class="panel panel-grid">
            <div class="panel-header">
              <span>练字格</span>
              <div class="toggle-group">
                <label class="toggle-label">
                  <input
                    type="checkbox"
                    v-model="showMiGrid"
                  />
                  <span>米字格</span>
                </label>
              </div>
            </div>
            <div class="grid-wrapper">
              <canvas
                ref="gridCanvasRef"
                class="grid-canvas"
              ></canvas>
            </div>
          </div>
          <div class="panel panel-info">
            <div class="panel-header">
              <span>拼音与笔顺</span>
            </div>
            <div class="pinyin">
              <div class="pinyin-label">拼音</div>
              <div class="pinyin-value">
                <span v-if="currentPinyin">{{ currentPinyin }}</span>
                <span v-else>无</span>
              </div>
            </div>
            <div class="stroke-section">
              <div class="stroke-view" ref="strokeContainerRef"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <footer class="footer">
      <div>字体来源：AaBiZouLongSheXingKaiTi-2.ttf</div>
      <div>笔顺数据来源：Make Me a Hanzi / Hanzi Writer 数据集</div>
    </footer>
    <div class="print-layout">
      <div class="print-grid-wrapper">
        <img
          v-if="printImageDataUrl"
          :src="printImageDataUrl"
          class="print-grid-image"
        />
      </div>
      <div class="print-pinyin">
        <span v-if="currentPinyin">{{ currentPinyin }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { pinyin } from "pinyin-pro";
import { debounce } from "./utils/debounce";
import { extractFirstChineseCharacter } from "./utils/text";
import { drawGridAndCharacter } from "./utils/gridCanvas";
import { useStrokePlayer } from "./stroke/useStrokePlayer";

const inputValue = ref("");
const inputPlaceholder = "请输入汉字，系统将使用第一个汉字进行练字展示";
const statusMessage = ref("");
const currentChar = ref("");
const currentPinyin = ref("");
const showMiGrid = ref(true);
const gridCanvasRef = ref<HTMLCanvasElement | null>(null);
const printImageDataUrl = ref<string | null>(null);
const isFontLoaded = ref(false);

const strokeContainerRef = ref<HTMLElement | null>(null);
const strokeState = reactive(
  useStrokePlayer({
    containerRef: strokeContainerRef
  })
);

function loadCustomFont() {
  if (!("fonts" in document)) {
    isFontLoaded.value = true;
    if (currentChar.value) {
      scheduleRedraw();
    }
    return;
  }
  document.fonts
    .load('64px "BiZouXingKai"')
    .then(() => {
      isFontLoaded.value = true;
      if (currentChar.value) {
        scheduleRedraw();
      }
    })
    .catch(() => {
      isFontLoaded.value = true;
      statusMessage.value = "字体加载失败，当前使用系统默认字体";
      if (currentChar.value) {
        scheduleRedraw();
      }
    });
}

const scheduleRedraw = debounce(() => {
  const canvas = gridCanvasRef.value;
  if (!canvas || !currentChar.value) {
    return;
  }
  drawGridAndCharacter({
    canvas,
    character: currentChar.value,
    useMiGrid: showMiGrid.value,
    fontFamily: isFontLoaded.value ? "BiZouXingKai, KaiTi, serif" : "KaiTi, serif"
  }).then(dataUrl => {
    printImageDataUrl.value = dataUrl;
  });
}, 50);

function updateFromInput() {
  const char = extractFirstChineseCharacter(inputValue.value);
  if (!char) {
    currentChar.value = "";
    currentPinyin.value = "";
    statusMessage.value = "请输入一个汉字";
    printImageDataUrl.value = null;
    strokeState.reset();
    return;
  }
  currentChar.value = char;
  statusMessage.value = "";
  const pinyinResult = pinyin(char, {
    toneType: "withToneMark",
    pattern: "pinyin",
    type: "string"
  });
  currentPinyin.value = pinyinResult || "";
  strokeState.loadCharacter(char);
  scheduleRedraw();
}

const debouncedUpdateFromInput = debounce(updateFromInput, 300);

function handleInput() {
  debouncedUpdateFromInput();
}

function handleGenerate() {
  updateFromInput();
}

function handleClear() {
  inputValue.value = "";
  currentChar.value = "";
  currentPinyin.value = "";
  statusMessage.value = "请输入一个汉字";
  printImageDataUrl.value = null;
  strokeState.reset();
}

function handlePrint() {
  if (!currentChar.value) {
    statusMessage.value = "请先输入一个汉字后再打印";
    return;
  }
  if (!printImageDataUrl.value) {
    scheduleRedraw();
    setTimeout(() => {
      window.print();
    }, 200);
    return;
  }
  window.print();
}

watch(showMiGrid, () => {
  if (currentChar.value) {
    scheduleRedraw();
  }
});

onMounted(() => {
  loadCustomFont();
  if (gridCanvasRef.value) {
    scheduleRedraw();
  }
  strokeState.init();
});

onBeforeUnmount(() => {
  strokeState.dispose();
});
</script>
