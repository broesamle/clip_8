SHELL := /bin/bash

all:
	mkdir -p wasm
	cd iscd; \
	  cargo build --target=wasm32-unknown-emscripten --release; \
	  find target/wasm32-unknown-emscripten/release/deps -type f -name "*.wasm" | xargs -I {} cp {} ../wasm/iscd.wasm; \
	  find target/wasm32-unknown-emscripten/release/deps -type f ! -name "*.asm.js" -name "*.js" | xargs -I {} cp {} ../wasm/iscd.js
