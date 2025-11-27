/// <reference types="aframe" />

declare module "*.glb";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": any;
      "a-entity": any;
      "a-assets": any;
      "a-asset-item": any;
      "a-camera": any;
      "a-sky": any;
      "a-marker": any;
    }
  }
}

export {};
