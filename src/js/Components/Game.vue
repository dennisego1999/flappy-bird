<script setup>
import Game from '@js/Classes/Game.js';
import { onBeforeUnmount, onMounted } from 'vue';

// Set variables
let game;

// Define functions
function initGame() {
	game = new Game('game-canvas');
}

// Life cycles
onMounted(() => {
	// Init game
	initGame();
});

onBeforeUnmount(() => {
	// Destroy game
	game.destroy();
});
</script>

<template>
	<div class="relative h-[100dvh] w-screen">
		<canvas id="game-canvas" class="h-full w-full" />
	</div>
</template>
