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

	// Add event listener
	window.addEventListener('resize', () => game.resize());
});

onBeforeUnmount(() => {
	// Destroy game
	game.destroy();

	// Remove event listener
	window.removeEventListener('resize', () => game.resize());
});
</script>

<template>
	<div class="relative h-[100dvh] w-screen">
		<canvas id="game-canvas" class="h-full w-full" />
	</div>
</template>
