<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import Game from '@js/Classes/Game.js';

// Life cycles
onMounted(() => {
	// Init game
	Game.init('game-canvas');

	// Add event listener
	window.addEventListener('resize', () => Game.resize());
});

onBeforeUnmount(() => {
	// Destroy game
	Game.destroy();

	// Remove event listener
	window.removeEventListener('resize', () => Game.resize());
});
</script>

<template>
	<div class="relative h-[100dvh] w-screen">
		<canvas id="game-canvas" class="h-full w-full" />
	</div>
</template>
