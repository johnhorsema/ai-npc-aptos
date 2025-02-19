<template>
    <Radar :data="data" :options="options" />
</template>

<script setup>
import { ref, computed } from "vue";
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";
import { Radar } from "vue-chartjs";

// Register ChartJS components
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
);

const props = defineProps({
    data: Object,
});

// Define chart data and options
const data = computed(() => {
    return {
        labels: [
            "Openness",
            "Conscientiousness",
            "Extraversion",
            "Agreeableness",
            "Neuroticism",
        ],
        datasets: [
            {
                label: "Personality Traits",
                backgroundColor: "rgba(54, 162, 235, 0.2)", // Light blue fill
                borderColor: "rgba(54, 162, 235, 1)", // Blue border
                pointBackgroundColor: "rgba(54, 162, 235, 1)", // Blue points
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(54, 162, 235, 1)",
                data: Object.values(props.data),
            },
        ],
    };
});

const options = ref({
    responsive: true,
    maintainAspectRatio: true,
    scales: {
        r: {
            angleLines: {
                display: true,
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
                stepSize: 20,
                beginAtZero: true,
            },
        },
    },
    plugins: {
        legend: {
            display: true,
            position: "top",
        },
        tooltip: {
            enabled: true,
        },
    },
});
</script>
