<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import Game from '@js/Classes/Game.js';

// Life cycles
onMounted(async () => {
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
		<Transition name="fade" mode="out-in">
			<div
				v-if="Game.isGameOver.value"
				class="absolute inset-0 z-10 flex h-full w-full items-center justify-center bg-black/[0.5]"
			>
				<span class="rounded-lg bg-white p-2 font-extrabold">Game over</span>
			</div>

			<div v-else class="absolute right-2 top-2 z-50 rounded-lg bg-white p-2">
				<span class="font-extrabold text-black">Score: {{ Game.score.value }}</span>
			</div>
		</Transition>

		<canvas id="game-canvas" class="h-full w-full" />
	</div>
</template>
