import { pipeline, env } from "@xenova/transformers";

export class FeatureExtractionPipeline {
  static task = "feature-extraction";
  static model = "jinaai/jina-embeddings-v2-base-zh";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      // Specify a custom location for models (defaults to '/models/').
      env.localModelPath = "./server/models/";

      // Disable the loading of remote models from the Hugging Face Hub:
      env.allowRemoteModels = false;

      // Set location of .wasm files. Defaults to use a CDN.
      env.backends.onnx.wasm.wasmPaths = "./node_modules/onnxruntime-web/dist/";

      // Disable spawning worker threads for testing.
      // Source: https://github.com/xenova/transformers.js/issues/4#issuecomment-1455077289
      env.backends.onnx.wasm.numThreads = 1;

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}
